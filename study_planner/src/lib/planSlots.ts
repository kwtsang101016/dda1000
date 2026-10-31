import { freeElectiveUnits } from "../data/majors";
import { getPattern } from "../data/patterns";
import { ROLE_LABELS } from "../data/streams";
import { UC_SLOT_TEMPLATES } from "../data/universityCore";
import type { FeStreamId, MajorId, ManualCourse, RoleTag } from "../data/types";
import { getCourse } from "./courseUtils";

export type SlotKind = "catalog" | "elective" | "uc" | "free";

export interface PlanSlot {
  id: string;
  kind: SlotKind;
  year?: number;
  term?: 1 | 2;
  termLabel?: string;
  role: string;
  roleTag?: RoleTag;
  /** Seeded "or" options for catalogue slots. */
  options?: string[];
  /** Default units for empty elective / UC / free slots. */
  units: number;
  category?: string;
}

/** Catalogue / elective: course code or null. UC / free: JSON ManualCourse or null encoded separately. */
export type PlanAssignments = Record<string, string | null>;
export type ManualAssignments = Record<string, ManualCourse | null>;

/** Where a University Core / Free Elective slot sits in the year–term timeline. */
export type TermPlacement = { year: number; term: 1 | 2 };
export type SlotPlacements = Record<string, TermPlacement>;

export function termLabelFor(term: 1 | 2): string {
  return term === 1 ? "1st term" : "2nd term";
}

export function isPlacedInTerm(
  placements: SlotPlacements,
  slotId: string,
  year: number,
  term: 1 | 2,
): boolean {
  const p = placements[slotId];
  return Boolean(p && p.year === year && p.term === term);
}

export function buildMajorSlots(major: MajorId, feStream?: FeStreamId | null): PlanSlot[] {
  const pattern = getPattern(major, feStream);
  const slots: PlanSlot[] = [];
  let electiveSerial = 0;
  let choiceSerial = 0;

  for (const row of pattern) {
    if (row.electiveSlots && row.electiveSlots > 0) {
      for (let i = 0; i < row.electiveSlots; i++) {
        electiveSerial += 1;
        slots.push({
          id: `el-y${row.year}t${row.term}-${electiveSerial}`,
          kind: "elective",
          year: row.year,
          term: row.term,
          termLabel: row.label,
          role: ROLE_LABELS["major-elective"],
          roleTag: "major-elective",
          units: 3,
        });
      }
      continue;
    }

    for (const group of row.groups) {
      choiceSerial += 1;
      const id =
        group.length === 1
          ? `cat-${group[0]}-y${row.year}t${row.term}-${choiceSerial}`
          : `choice-y${row.year}t${row.term}-${choiceSerial}`;
      slots.push({
        id,
        kind: "catalog",
        year: row.year,
        term: row.term,
        termLabel: row.label,
        role: ROLE_LABELS[row.role],
        roleTag: row.role,
        options: group,
        units: getCourse(group[0])?.units ?? 3,
      });
    }
  }
  return slots;
}

export function buildUcSlots(): PlanSlot[] {
  return UC_SLOT_TEMPLATES.map((t) => ({
    id: t.id,
    kind: "uc" as const,
    role: "University core",
    category: t.category,
    units: t.defaultUnits,
  }));
}

export function buildFreeSlots(major: MajorId): PlanSlot[] {
  const total = freeElectiveUnits(major);
  const slots: PlanSlot[] = [];
  let remaining = total;
  let i = 0;
  while (remaining > 0) {
    i += 1;
    const u = Math.min(3, remaining);
    slots.push({
      id: `free-${i}`,
      kind: "free",
      role: "Free elective",
      units: u,
    });
    remaining -= u;
  }
  return slots;
}

export function seedCatalogAssignments(
  major: MajorId,
  feStream?: FeStreamId | null,
): PlanAssignments {
  const slots = buildMajorSlots(major, feStream);
  const assignments: PlanAssignments = {};
  for (const slot of slots) {
    if (slot.kind === "elective") {
      assignments[slot.id] = null;
    } else if (slot.options && slot.options.length > 0) {
      assignments[slot.id] = slot.options[0];
    } else {
      assignments[slot.id] = null;
    }
  }
  return assignments;
}

export function emptyManualAssignments(slots: PlanSlot[]): ManualAssignments {
  const out: ManualAssignments = {};
  for (const slot of slots) {
    if (slot.kind === "uc" || slot.kind === "free") out[slot.id] = null;
  }
  return out;
}

export function resolvedCatalogCode(slot: PlanSlot, assignments: PlanAssignments): string | null {
  return assignments[slot.id] ?? null;
}

export function takenCodes(
  slots: PlanSlot[],
  assignments: PlanAssignments,
  exceptId?: string,
): Set<string> {
  const set = new Set<string>();
  for (const slot of slots) {
    if (slot.id === exceptId) continue;
    if (slot.kind !== "catalog" && slot.kind !== "elective") continue;
    const code = assignments[slot.id];
    if (code) set.add(code);
  }
  return set;
}

export function catalogUnits(slots: PlanSlot[], assignments: PlanAssignments): number {
  let sum = 0;
  for (const slot of slots) {
    if (slot.kind !== "catalog" && slot.kind !== "elective") continue;
    const code = assignments[slot.id];
    if (!code) continue;
    sum += getCourse(code)?.units ?? slot.units;
  }
  return sum;
}

export function manualUnits(manual: ManualAssignments): number {
  return Object.values(manual).reduce((sum, course) => sum + (course?.units ?? 0), 0);
}
