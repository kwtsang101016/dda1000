import type { FeStreamId, MajorId, ManualCourse } from "../data/types";
import {
  emptyManualAssignments,
  seedCatalogAssignments,
  type ManualAssignments,
  type PlanAssignments,
  type SlotPlacements,
  type TermPlacement,
} from "./planSlots";
import { buildFreeSlots, buildUcSlots } from "./planSlots";

const STORAGE_KEY = "dda1000-study-planner-v1";

export interface StoredState {
  major: MajorId | null;
  feStream: FeStreamId | null;
  assignments: PlanAssignments;
  manual: ManualAssignments;
  placements: SlotPlacements;
}

export interface PlanExportBundle {
  format: "dda1000-study-planner";
  version: 1;
  exportedAt: string;
  major: MajorId | null;
  feStream: FeStreamId | null;
  assignments: PlanAssignments;
  manual: ManualAssignments;
  placements: SlotPlacements;
}

const MAJORS: MajorId[] = ["CSE", "DSBDT", "STA", "FE"];

function isMajor(v: unknown): v is MajorId {
  return typeof v === "string" && (MAJORS as string[]).includes(v);
}

function isFe(v: unknown): v is FeStreamId {
  return v === "qf" || v === "fintech";
}

function parsePlacements(raw: unknown): SlotPlacements {
  if (!raw || typeof raw !== "object") return {};
  const out: SlotPlacements = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const year = (value as TermPlacement).year;
    const term = (value as TermPlacement).term;
    if (
      typeof year === "number" &&
      (term === 1 || term === 2) &&
      year >= 1 &&
      year <= 4
    ) {
      out[id] = { year, term };
    }
  }
  return out;
}

export function loadSavedState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw) as StoredState;
    const major = isMajor(parsed.major) ? parsed.major : null;
    const feStream = isFe(parsed.feStream) ? parsed.feStream : null;
    return {
      major,
      feStream,
      assignments:
        parsed.assignments && typeof parsed.assignments === "object"
          ? parsed.assignments
          : major
            ? seedCatalogAssignments(major, feStream)
            : {},
      manual:
        parsed.manual && typeof parsed.manual === "object"
          ? parsed.manual
          : emptyManualAssignments([
              ...buildUcSlots(),
              ...(major ? buildFreeSlots(major) : []),
            ]),
      placements: parsePlacements(parsed.placements),
    };
  } catch {
    return blankState();
  }
}

function blankState(): StoredState {
  return {
    major: null,
    feStream: null,
    assignments: {},
    manual: {},
    placements: {},
  };
}

export function savePlannerState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function downloadPlanExport(state: StoredState): void {
  const bundle: PlanExportBundle = {
    format: "dda1000-study-planner",
    version: 1,
    exportedAt: new Date().toISOString(),
    ...state,
  };
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const stamp = new Date().toISOString().slice(0, 10);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dda1000-plan-${state.major ?? "draft"}-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importPlanFromFile(file: File): Promise<StoredState> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  if (!data || typeof data !== "object") {
    throw new Error("That file does not look like a planner export.");
  }
  const obj = data as Record<string, unknown>;
  if (obj.format !== "dda1000-study-planner") {
    throw new Error("Unrecognized plan file. Use a JSON export from this planner.");
  }
  const major = isMajor(obj.major) ? obj.major : null;
  const feStream = isFe(obj.feStream) ? obj.feStream : null;
  const assignments =
    obj.assignments && typeof obj.assignments === "object"
      ? (obj.assignments as PlanAssignments)
      : {};
  const manual =
    obj.manual && typeof obj.manual === "object"
      ? (obj.manual as ManualAssignments)
      : {};
  const placements = parsePlacements(obj.placements);
  const state = { major, feStream, assignments, manual, placements };
  savePlannerState(state);
  return state;
}

export type { ManualCourse };
