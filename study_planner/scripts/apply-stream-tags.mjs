import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const reqPath = path.join(root, "src/data/streamRequirements.ts");
const coursesPath = path.join(root, "src/data/courses.ts");

const req = fs.readFileSync(reqPath, "utf8");
const streamMajor = {
  "cse-ai": "CSE",
  "ds-method": "DSBDT",
  "ds-finance": "DSBDT",
  "ds-ops": "DSBDT",
  "ds-life": "DSBDT",
  "ds-computing": "DSBDT",
  "sta-math": "STA",
  "sta-method": "STA",
  "sta-biostat": "STA",
  "sta-finance": "STA",
  "sta-computing": "STA",
};

/** @type {Record<string, string[]>} */
const streamCourses = {};
for (const id of Object.keys(streamMajor)) {
  const m = req.match(
    new RegExp(`"${id}":\\s*\\{[\\s\\S]*?courses:\\s*\\[([\\s\\S]*?)\\],`),
  );
  if (!m) {
    console.warn("missing block", id);
    continue;
  }
  const codes = [];
  for (const om of m[1].matchAll(/or\("([^"]+)"(?:,\s*"([^"]+)")?\)/g)) {
    codes.push(om[1]);
    if (om[2]) codes.push(om[2]);
  }
  streamCourses[id] = [...new Set(codes)];
  console.log(id, streamCourses[id].length);
}

/** code -> major -> Set(stream) */
const codeStreams = {};
for (const [id, codes] of Object.entries(streamCourses)) {
  const maj = streamMajor[id];
  for (const code of codes) {
    if (!codeStreams[code]) codeStreams[code] = {};
    if (!codeStreams[code][maj]) codeStreams[code][maj] = new Set();
    codeStreams[code][maj].add(id);
  }
}

let content = fs.readFileSync(coursesPath, "utf8");
const existing = new Set(
  [...content.matchAll(/code:\s*"([^"]+)"/g)].map((m) => m[1]),
);

function streamsLiteral(set) {
  return [...set].sort().map((s) => `"${s}"`).join(", ");
}

function patchOffering(chunk, maj, streams) {
  const lit = streamsLiteral(streams);
  if (/streams:\s*\[[^\]]*\]\s*as StreamTag\[\]/.test(chunk)) {
    return chunk.replace(
      /streams:\s*\[[^\]]*\]\s*as StreamTag\[\]/,
      `streams: [${lit}] as StreamTag[]`,
    );
  }
  // insert before closing }
  return chunk.replace(/\}\s*$/, `, streams: [${lit}] as StreamTag[] }`);
}

function patchCourseLine(line, code) {
  const byMaj = codeStreams[code];
  if (!byMaj) return line;
  let next = line;
  for (const [maj, streams] of Object.entries(byMaj)) {
    const majRe = new RegExp(`${maj}:\\s*\\{[^}]*\\}`);
    if (majRe.test(next)) {
      next = next.replace(majRe, (chunk) => patchOffering(chunk, maj, streams));
    } else if (/offerings:\s*\{/.test(next)) {
      const lit = streamsLiteral(streams);
      next = next.replace(
        /offerings:\s*\{/,
        `offerings: { ${maj}: { roles: ["major-elective"] as RoleTag[], streams: [${lit}] as StreamTag[] }, `,
      );
    }
  }
  return next;
}

const lines = content.split(/\r?\n/);
const out = lines.map((line) => {
  const m = line.match(/code:\s*"([^"]+)"/);
  if (!m) return line;
  return patchCourseLine(line, m[1]);
});

const missing = Object.keys(codeStreams)
  .filter((c) => !existing.has(c))
  .sort();
const inserts = missing.map((code) => {
  const parts = Object.entries(codeStreams[code]).map(([maj, streams]) => {
    const lit = streamsLiteral(streams);
    return `${maj}: { roles: ["major-elective"] as RoleTag[], streams: [${lit}] as StreamTag[] }`;
  });
  return `  { code: "${code}", title: "${code}", units: 3, offerings: { ${parts.join(", ")} } },`;
});

const endIdx = out.findIndex((l) => l.trim() === "];");
if (endIdx >= 0 && inserts.length) {
  out.splice(endIdx, 0, ...inserts);
}

fs.writeFileSync(coursesPath, out.join("\n") + (out[out.length - 1] === "" ? "" : "\n"));
console.log("patched courses; missing inserted:", missing.length, missing.join(", "));
const ds = (fs.readFileSync(coursesPath, "utf8").match(/ds-method|ds-finance|ds-ops|ds-life|ds-computing/g) || []).length;
console.log("ds tag mentions:", ds);
