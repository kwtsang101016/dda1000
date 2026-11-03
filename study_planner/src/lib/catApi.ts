import type { PlanExportBundle, StoredState } from "./storage";

const DEFAULT_CAT_API = "https://dda1000-cat.onrender.com";

export function catApiBase(): string {
  const fromEnv = (import.meta.env.VITE_CAT_API_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Local CAT during planner `npm run dev` when proxying isn't set.
  if (typeof window !== "undefined" && /localhost|127\.0\.0\.1/.test(window.location.hostname)) {
    return "http://localhost:3001";
  }
  return DEFAULT_CAT_API;
}

export interface CatRosterCard {
  id: string;
  name: string;
  englishName: string;
  role: string;
}

export async function fetchCatRosterCards(): Promise<CatRosterCard[]> {
  const response = await fetch(`${catApiBase()}/api/roster-cards`);
  if (!response.ok) {
    throw new Error("Could not load the class roster from CAT. Is the CAT server awake?");
  }
  const data = (await response.json()) as { people?: CatRosterCard[] };
  return Array.isArray(data.people) ? data.people : [];
}

export function buildPlanExportBundle(state: StoredState): PlanExportBundle {
  return {
    format: "dda1000-study-planner",
    version: 1,
    exportedAt: new Date().toISOString(),
    ...state,
  };
}

export async function submitPlanToCat(options: {
  personId: string;
  studentId: string;
  state: StoredState;
}): Promise<{ submittedAt: string; major: string | null }> {
  const plan = buildPlanExportBundle(options.state);
  const response = await fetch(`${catApiBase()}/api/study-plans/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personId: options.personId,
      studentId: options.studentId,
      plan,
    }),
  });
  const payload = (await response.json()) as {
    ok?: boolean;
    message?: string;
    submittedAt?: string;
    major?: string | null;
  };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message || "CAT rejected the submission.");
  }
  return {
    submittedAt: payload.submittedAt ?? new Date().toISOString(),
    major: payload.major ?? null,
  };
}

export interface CatViewedPlan {
  personId: string;
  name: string;
  englishName: string;
  submittedAt: string;
  major: string | null;
  feStream: string | null;
  plan: unknown;
}

export async function fetchPlanByCatToken(token: string): Promise<CatViewedPlan> {
  const response = await fetch(
    `${catApiBase()}/api/study-plans/view/${encodeURIComponent(token)}`,
  );
  const payload = (await response.json()) as CatViewedPlan & {
    ok?: boolean;
    message?: string;
  };
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || "Could not load that study plan from CAT.");
  }
  return payload;
}
