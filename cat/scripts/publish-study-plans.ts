/**
 * Copy submitted study plans from CAT into the public calendar.
 *
 *   npx tsx scripts/publish-study-plans.ts --date 2026-11-06
 *
 * Matches each plan to the attendance snapshot id (student-01, …) by roster order.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Role, Roster } from "../shared/types.ts";

const DEFAULT_SERVER = "https://dda1000-cat.onrender.com";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const catDir = path.resolve(scriptDir, "..");
const calendarDir = path.resolve(catDir, "../calendar");

interface SharedPlan {
  personId: string;
  name: string;
  englishName: string;
  role: string;
  submittedAt: string;
  major: string | null;
  feStream: string | null;
  plan: unknown;
}

interface AttendancePerson {
  id: string;
  name: string;
}

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function attendanceIds(roster: Roster): Map<string, { id: string; name: string }> {
  const roleOrder: Role[] = ["aa", "pa", "student", "guest"];
  const counters = new Map<Role, number>();
  const byRosterId = new Map<string, { id: string; name: string }>();
  const people = [...roster.people].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  );
  for (const person of people) {
    const next = (counters.get(person.role) ?? 0) + 1;
    counters.set(person.role, next);
    byRosterId.set(person.id, {
      id: `${person.role}-${String(next).padStart(2, "0")}`,
      name: person.name,
    });
  }
  return byRosterId;
}

async function main(): Promise<void> {
  const date = argValue("--date") ?? "2026-11-06";
  const server = process.env.CAT_SERVER?.trim() || DEFAULT_SERVER;
  const response = await fetch(`${server}/api/study-plans/shared`);
  if (!response.ok) {
    throw new Error(`CAT did not return study plans (${response.status}). The shared route may still be deploying.`);
  }
  const payload = (await response.json()) as { ok?: boolean; plans?: SharedPlan[]; message?: string };
  if (!payload.ok || !Array.isArray(payload.plans)) {
    throw new Error(payload.message ?? "CAT returned an unexpected study-plan list.");
  }

  const roster = JSON.parse(await readFile(path.join(catDir, "src/data/roster.json"), "utf8")) as Roster;
  const ids = attendanceIds(roster);
  const attendance = JSON.parse(
    await readFile(path.join(calendarDir, "public/attendance", `${date}.json`), "utf8"),
  ) as { people?: AttendancePerson[] };
  const attendanceById = new Map((attendance.people ?? []).map((person) => [person.id, person.name]));

  const plans = payload.plans.map((plan) => {
    const linked = ids.get(plan.personId);
    if (!linked) {
      throw new Error(`Study plan ${plan.personId} is not on the class roster.`);
    }
    const attendanceName = attendanceById.get(linked.id);
    if (attendanceName !== linked.name) {
      throw new Error(
        `Attendance id ${linked.id} is ${attendanceName ?? "missing"}, but roster ${plan.personId} is ${linked.name}.`,
      );
    }
    return {
      id: linked.id,
      rosterId: plan.personId,
      name: plan.name,
      englishName: plan.englishName,
      submittedAt: plan.submittedAt,
      major: plan.major,
      feStream: plan.feStream,
      plan: plan.plan,
    };
  });

  const outPath = path.join(calendarDir, "public/study-plans", `${date}.json`);
  const file = {
    date,
    course: roster.course,
    section: roster.section,
    exportedAt: new Date().toISOString(),
    count: plans.length,
    plans,
  };
  await writeFile(outPath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${plans.length} study plans to ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
