/**
 * Turn a CAT "Save attendance" CSV into a read-only snapshot for the course calendar.
 *
 *   npx tsx scripts/export-attendance.ts <csv> --label "Getting to know people"
 *
 * Merges the CSV with roster.json and the live CAT profiles (photos, college, country,
 * hobbies), then writes ../calendar/public/attendance/<date>.json. Person ids are replaced
 * by neutral sequential ids so student numbers never reach the public site.
 */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { io } from "socket.io-client";
import type { ClassroomState, PersonProfile, Roster, Role, ServerSnapshot } from "../shared/types.ts";

const DEFAULT_SERVER = "https://dda1000-cat.onrender.com";
const SNAPSHOT_TIMEOUT_MS = 90_000;
const COURSE_TIME_ZONE = "Asia/Shanghai";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const catDir = path.resolve(scriptDir, "..");
const defaultOutDir = path.resolve(catDir, "../calendar/public/attendance");

interface CliOptions {
  csvPath: string;
  label: string;
  server: string;
  outDir: string;
  skipLive: boolean;
}

interface CsvRecord {
  recordedAt: string;
  personId: string;
  name: string;
  englishName: string;
  role: Role;
  present: boolean;
  zone: "advisor" | "student" | "";
  rowLabel: string;
  seatIndex: number | null;
}

interface SnapshotPerson {
  id: string;
  name: string;
  englishName: string;
  role: Role;
  leading?: boolean;
  college?: string;
  plan?: string;
  country?: string;
  hobbies?: string;
  photo?: string;
  photoDataUrl?: string;
  profileCollege?: string;
  profileCountry?: string;
  profileHobbies?: string;
  present: boolean;
  placement: { zone: "advisor" | "student"; row: number; seat: number } | null;
}

function parseArgs(argv: string[]): CliOptions {
  const positional: string[] = [];
  const flags = new Map<string, string>();
  let skipLive = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--no-live") {
      skipLive = true;
    } else if (arg.startsWith("--")) {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error(`Missing value for ${arg}`);
      }
      flags.set(arg.slice(2), value);
      index += 1;
    } else {
      positional.push(arg);
    }
  }
  const csvPath = positional[0];
  const label = flags.get("label");
  if (!csvPath || !label) {
    throw new Error('Usage: npx tsx scripts/export-attendance.ts <csv> --label "<theme>" [--server URL] [--out DIR] [--no-live]');
  }
  return {
    csvPath: path.resolve(csvPath),
    label,
    server: flags.get("server") ?? DEFAULT_SERVER,
    outDir: path.resolve(flags.get("out") ?? defaultOutDir),
    skipLive,
  };
}

/** RFC 4180 line splitter (handles quoted fields with commas and doubled quotes). */
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === '"' && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(text: string): CsvRecord[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  const [headerLine, ...rows] = lines;
  if (!headerLine) {
    throw new Error("CSV is empty.");
  }
  const header = splitCsvLine(headerLine);
  const column = (name: string): number => {
    const index = header.indexOf(name);
    if (index < 0) {
      throw new Error(`CSV is missing the "${name}" column.`);
    }
    return index;
  };
  const columns = {
    recordedAt: column("recorded_at"),
    personId: column("person_id"),
    name: column("name"),
    englishName: column("english_name"),
    role: column("role"),
    present: column("present"),
    zone: column("zone"),
    rowLabel: column("row_label"),
    seatIndex: column("seat_index"),
  };
  return rows.map((line, lineIndex) => {
    const cells = splitCsvLine(line);
    const role = cells[columns.role] as Role;
    if (!["aa", "pa", "student", "guest"].includes(role)) {
      throw new Error(`Line ${lineIndex + 2}: unknown role "${cells[columns.role]}".`);
    }
    const zone = cells[columns.zone];
    const seatRaw = cells[columns.seatIndex];
    return {
      recordedAt: cells[columns.recordedAt],
      personId: cells[columns.personId],
      name: cells[columns.name],
      englishName: cells[columns.englishName] ?? "",
      role,
      present: cells[columns.present] === "yes",
      zone: zone === "advisor" || zone === "student" ? zone : "",
      rowLabel: cells[columns.rowLabel] ?? "",
      seatIndex: seatRaw === "" || seatRaw === undefined ? null : Number(seatRaw),
    };
  });
}

function toPlacement(record: CsvRecord): SnapshotPerson["placement"] {
  if (!record.zone || record.seatIndex === null || Number.isNaN(record.seatIndex)) {
    return null;
  }
  if (record.zone === "advisor") {
    return { zone: "advisor", row: 0, seat: record.seatIndex };
  }
  const match = /^Row\s+(\d+)$/i.exec(record.rowLabel.trim());
  if (!match) {
    throw new Error(`Cannot read the row number from "${record.rowLabel}" (${record.name}).`);
  }
  return { zone: "student", row: Number(match[1]) - 1, seat: record.seatIndex };
}

function localDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: COURSE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

async function fetchLiveState(server: string): Promise<ClassroomState> {
  console.log(`Connecting to ${server} for live profiles (may take a minute if Render is asleep)…`);
  const socket = io(server, { path: "/socket.io", transports: ["websocket", "polling"], reconnection: true });
  try {
    return await new Promise<ClassroomState>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Timed out waiting for the CAT snapshot.")), SNAPSHOT_TIMEOUT_MS);
      socket.once("snapshot", (snapshot: ServerSnapshot) => {
        clearTimeout(timer);
        resolve(snapshot.state);
      });
    });
  } finally {
    socket.disconnect();
  }
}

function profileFields(profile: PersonProfile | undefined): Partial<SnapshotPerson> {
  if (!profile) {
    return {};
  }
  const fields: Partial<SnapshotPerson> = {};
  if (profile.photoDataUrl) fields.photoDataUrl = profile.photoDataUrl;
  if (profile.college) fields.profileCollege = profile.college;
  if (profile.country) fields.profileCountry = profile.country;
  if (profile.hobbies) fields.profileHobbies = profile.hobbies;
  return fields;
}

function stripEmpty<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, field]) => field !== "" && field !== undefined)) as T;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const [csvText, rosterText] = await Promise.all([
    readFile(options.csvPath, "utf8"),
    readFile(path.join(catDir, "src/data/roster.json"), "utf8"),
  ]);
  const records = parseCsv(csvText);
  const roster = JSON.parse(rosterText) as Roster;
  if (records.length === 0) {
    throw new Error("CSV has no attendance rows.");
  }

  let liveState: ClassroomState | null = null;
  if (!options.skipLive) {
    try {
      liveState = await fetchLiveState(options.server);
    } catch (error) {
      console.warn(`Live profiles unavailable (${error instanceof Error ? error.message : String(error)}); using roster only.`);
    }
  }

  const recordsById = new Map(records.map((record) => [record.personId, record]));
  const rosterIds = new Set(roster.people.map((person) => person.id));
  const roleOrder: Role[] = ["aa", "pa", "student", "guest"];
  const counters = new Map<Role, number>();
  const neutralId = (role: Role): string => {
    const next = (counters.get(role) ?? 0) + 1;
    counters.set(role, next);
    return `${role}-${String(next).padStart(2, "0")}`;
  };

  const fromRoster: SnapshotPerson[] = [...roster.people]
    .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
    .map((person) => {
      const record = recordsById.get(person.id);
      return stripEmpty<SnapshotPerson>({
        id: neutralId(person.role),
        name: person.name,
        englishName: person.englishName,
        role: person.role,
        leading: person.leading || undefined,
        college: person.college,
        plan: person.plan,
        country: person.country,
        hobbies: person.hobbies,
        photo: person.photo,
        ...profileFields(liveState?.profiles[person.id]),
        present: record?.present ?? false,
        placement: record ? toPlacement(record) : null,
      });
    });

  const extras: SnapshotPerson[] = records
    .filter((record) => !rosterIds.has(record.personId))
    .map((record) =>
      stripEmpty<SnapshotPerson>({
        id: neutralId(record.role),
        name: record.name,
        englishName: record.englishName,
        role: record.role,
        present: record.present,
        placement: toPlacement(record),
      }),
    );

  const people = [...fromRoster, ...extras];
  const placements = people.flatMap((person) => (person.placement ? [person.placement] : []));
  const neededRows = Math.max(0, ...placements.filter((p) => p.zone === "student").map((p) => p.row + 1));
  const neededSeats = Math.max(0, ...placements.map((p) => p.seat + 1));

  const recordedAt = records[0].recordedAt;
  const date = localDate(recordedAt);
  const snapshot = {
    date,
    course: roster.course,
    section: roster.section,
    recordedAt,
    label: options.label,
    studentRowCount: Math.max(liveState?.studentRowCount ?? 0, neededRows),
    seatsPerRow: Math.max(liveState?.seatsPerRow ?? 0, neededSeats),
    people,
  };

  await mkdir(options.outDir, { recursive: true });
  const outPath = path.join(options.outDir, `${date}.json`);
  await writeFile(outPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const present = people.filter((person) => person.present).length;
  const withPhotos = people.filter((person) => person.photoDataUrl || person.photo).length;
  console.log(
    `Wrote ${path.relative(process.cwd(), outPath)}: ${present}/${people.length} present, ` +
      `${withPhotos} with photos, layout ${snapshot.studentRowCount} rows × ${snapshot.seatsPerRow} seats.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
