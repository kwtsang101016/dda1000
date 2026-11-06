import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StudyPlanMeta, StudyPlanRecord } from "../shared/types.ts";
import { MAX_STUDY_PLAN_JSON_LENGTH } from "../shared/types.ts";

const PLANS_REDIS_KEY = "dda1000:study-plans";
const VIEW_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

let plans: Record<string, StudyPlanRecord> = {};
const viewTokens = new Map<
  string,
  { personId: string; expiresAt: number }
>();

function redisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function redisCommand(command: unknown[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Redis request failed (${response.status}): ${text}`);
  }
  const payload = (await response.json()) as { result?: unknown };
  return payload.result ?? null;
}

function isStudyPlanRecord(value: unknown): value is StudyPlanRecord {
  if (!value || typeof value !== "object") return false;
  const r = value as StudyPlanRecord;
  return (
    typeof r.personId === "string" &&
    typeof r.submittedAt === "string" &&
    (r.major === null || typeof r.major === "string") &&
    (r.feStream === null || typeof r.feStream === "string") &&
    "plan" in r
  );
}

export async function loadStudyPlans(filePath: string): Promise<void> {
  if (redisConfigured()) {
    try {
      const raw = await redisCommand(["GET", PLANS_REDIS_KEY]);
      if (typeof raw === "string" && raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const next: Record<string, StudyPlanRecord> = {};
          for (const [id, entry] of Object.entries(parsed as Record<string, unknown>)) {
            if (isStudyPlanRecord(entry)) next[id] = entry;
          }
          plans = next;
          console.log(`Loaded ${Object.keys(plans).length} study plan(s) from Redis.`);
          return;
        }
      }
    } catch (error) {
      console.warn("Could not load study plans from Redis:", error);
    }
  }

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const next: Record<string, StudyPlanRecord> = {};
      for (const [id, entry] of Object.entries(parsed as Record<string, unknown>)) {
        if (isStudyPlanRecord(entry)) next[id] = entry;
      }
      plans = next;
      console.log(`Loaded ${Object.keys(plans).length} study plan(s) from file.`);
      if (redisConfigured()) {
        await redisCommand(["SET", PLANS_REDIS_KEY, JSON.stringify(plans)]);
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.warn("Could not read study plans file:", error);
    }
  }
}

async function persistPlans(filePath: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(plans, null, 2)}\n`, "utf8");
  if (redisConfigured()) {
    await redisCommand(["SET", PLANS_REDIS_KEY, JSON.stringify(plans)]);
  }
}

export function studyPlanMetaMap(): Record<string, StudyPlanMeta> {
  const meta: Record<string, StudyPlanMeta> = {};
  for (const [id, record] of Object.entries(plans)) {
    meta[id] = {
      submittedAt: record.submittedAt,
      major: record.major,
      feStream: record.feStream,
    };
  }
  return meta;
}

export function getStudyPlan(personId: string): StudyPlanRecord | null {
  return plans[personId] ?? null;
}

export function listStudyPlans(): StudyPlanRecord[] {
  return Object.values(plans).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
}

export function validatePlannerExport(plan: unknown): {
  major: string | null;
  feStream: string | null;
} {
  if (!plan || typeof plan !== "object") {
    throw new Error("Plan payload is missing.");
  }
  const obj = plan as Record<string, unknown>;
  if (obj.format !== "dda1000-study-planner") {
    throw new Error("Unrecognized plan format. Export JSON from the SDS study planner.");
  }
  const encoded = JSON.stringify(plan);
  if (encoded.length > MAX_STUDY_PLAN_JSON_LENGTH) {
    throw new Error("Plan is too large to submit. Remove extra notes or try again.");
  }
  const major = typeof obj.major === "string" ? obj.major : null;
  const feStream = typeof obj.feStream === "string" ? obj.feStream : null;
  return { major, feStream };
}

export async function saveStudyPlan(
  filePath: string,
  personId: string,
  plan: unknown,
): Promise<StudyPlanRecord> {
  const { major, feStream } = validatePlannerExport(plan);
  const record: StudyPlanRecord = {
    personId,
    submittedAt: new Date().toISOString(),
    major,
    feStream,
    plan,
  };
  plans[personId] = record;
  await persistPlans(filePath);
  return record;
}

export function createViewToken(personId: string): { token: string; expiresAt: string } {
  if (!plans[personId]) {
    throw new Error("That student has not submitted a study plan yet.");
  }
  const token = randomBytes(24).toString("hex");
  const expiresAt = Date.now() + VIEW_TOKEN_TTL_MS;
  viewTokens.set(token, { personId, expiresAt });
  return { token, expiresAt: new Date(expiresAt).toISOString() };
}

export function resolveViewToken(token: string): StudyPlanRecord {
  const entry = viewTokens.get(token);
  if (!entry) {
    throw new Error("This view link is invalid or has already been used.");
  }
  if (Date.now() > entry.expiresAt) {
    viewTokens.delete(token);
    throw new Error("This view link has expired. Open the plan again from CAT.");
  }
  const record = plans[entry.personId];
  if (!record) {
    throw new Error("That study plan is no longer available.");
  }
  return record;
}

/** Drop expired tokens occasionally. */
export function pruneViewTokens(): void {
  const now = Date.now();
  for (const [token, entry] of viewTokens) {
    if (entry.expiresAt <= now) viewTokens.delete(token);
  }
}
