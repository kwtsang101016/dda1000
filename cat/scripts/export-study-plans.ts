/**
 * Save submitted study plans from the live CAT server.
 *
 *   npx tsx scripts/export-study-plans.ts
 *
 * Without INSTRUCTOR_PIN this writes who submitted (name, major, time) only.
 * With INSTRUCTOR_PIN it also downloads each planner JSON via the existing view API.
 * The file is written under private/ and is not committed.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { io } from "socket.io-client";
import type { Roster, ServerSnapshot, StudyPlanMeta } from "../shared/types.ts";

const DEFAULT_SERVER = "https://dda1000-cat.onrender.com";
const SNAPSHOT_TIMEOUT_MS = 60_000;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const catDir = path.resolve(scriptDir, "..");

interface IndexRow {
  personId: string;
  name: string;
  englishName: string;
  role: string;
  submittedAt: string;
  major: string | null;
  feStream: string | null;
  plan?: unknown;
}

function stamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

async function fetchSnapshot(server: string): Promise<ServerSnapshot> {
  console.log(`Connecting to ${server}…`);
  const socket = io(server, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    reconnection: false,
  });
  try {
    return await new Promise<ServerSnapshot>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Timed out waiting for the CAT snapshot.")),
        SNAPSHOT_TIMEOUT_MS,
      );
      socket.once("snapshot", (snapshot: ServerSnapshot) => {
        clearTimeout(timer);
        resolve(snapshot);
      });
      socket.once("connect_error", (error: Error) => {
        clearTimeout(timer);
        reject(error);
      });
    });
  } finally {
    socket.disconnect();
  }
}

async function downloadPlan(
  server: string,
  personId: string,
  pin: string,
): Promise<unknown> {
  const tokenResponse = await fetch(`${server}/api/study-plans/view-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personId, instructorPin: pin }),
  });
  const tokenPayload = (await tokenResponse.json()) as {
    ok?: boolean;
    token?: string;
    message?: string;
  };
  if (!tokenResponse.ok || !tokenPayload.ok || !tokenPayload.token) {
    throw new Error(tokenPayload.message ?? `Could not open the plan for ${personId}.`);
  }
  const planResponse = await fetch(
    `${server}/api/study-plans/view/${encodeURIComponent(tokenPayload.token)}`,
  );
  const planPayload = (await planResponse.json()) as {
    ok?: boolean;
    plan?: unknown;
    message?: string;
  };
  if (!planResponse.ok || !planPayload.ok) {
    throw new Error(planPayload.message ?? `Could not download the plan for ${personId}.`);
  }
  return planPayload.plan;
}

async function main(): Promise<void> {
  const server = process.env.CAT_SERVER?.trim() || DEFAULT_SERVER;
  const pin = process.env.INSTRUCTOR_PIN?.trim() ?? "";
  const roster = JSON.parse(await readFile(path.join(catDir, "src/data/roster.json"), "utf8")) as Roster;
  const peopleById = new Map(roster.people.map((person) => [person.id, person]));
  const snapshot = await fetchSnapshot(server);
  const meta: Record<string, StudyPlanMeta> = snapshot.state.studyPlanMeta ?? {};
  const ids = Object.keys(meta).sort((a, b) => meta[a].submittedAt.localeCompare(meta[b].submittedAt));

  const plans: IndexRow[] = [];
  for (const personId of ids) {
    const person = peopleById.get(personId);
    const row: IndexRow = {
      personId,
      name: person?.name ?? personId,
      englishName: person?.englishName ?? "",
      role: person?.role ?? "student",
      submittedAt: meta[personId].submittedAt,
      major: meta[personId].major,
      feStream: meta[personId].feStream,
    };
    if (pin) {
      row.plan = await downloadPlan(server, personId, pin);
    }
    plans.push(row);
  }

  const now = new Date();
  const outDir = path.join(catDir, "private");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `study-plans-${stamp(now)}.json`);
  const file = {
    course: roster.course,
    section: roster.section,
    exportedAt: now.toISOString(),
    plansIncluded: Boolean(pin),
    count: plans.length,
    plans,
  };
  await writeFile(outPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(
    `Wrote ${plans.length} submission(s) to ${outPath}${pin ? " (full plans)" : " (names and majors only; set INSTRUCTOR_PIN for the course lists)"}.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
