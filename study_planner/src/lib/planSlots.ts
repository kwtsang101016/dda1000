import { freeElectiveUnits } from "../data/majors";
import { getPattern } from "../data/patterns";
import { ROLE_LABELS } from "../data/streams";
import { UC_SLOT_TEMPLATES } from "../data/universityCore";
import type { FeStreamId, MajorId, ManualCourse, RoleTag } from "../data/types";
import { getCourse } from "./courseUtils";

export type SlotKind = "catalog" | "elective" | "uc" | "free";

/** Regular terms plus optional Summer. */
export type TermKind = 1 | 2 | "summer";

export interface PlanSlot {
  id: string;
  kind: SlotKind;
  year?: number;
  term?: TermKind;
  termLabel?: string;
  role: string;
  roleTag?: RoleTag;
  /** Seeded "or" options for catalogue slots. */
  options?: string[];
  /** Default units for empty elective / UC / free slots. */
  units: number;
  category?: string;
  /** UC picker group heading. */
  ucGroup?: string;
  suggestedCode?: string;
  suggestedTitle?: string;
  hint?: string;
}

/** Catalogue / elective: course code or null. UC / free stored separately. */
export type PlanAssignments = Record<string, string | null>;
export type ManualAssignments = Record<string, ManualCourse | null>;

/** Where a slot sits in the year–term timeline (overrides pattern default). */
export type TermPlacement = { year: number; term: TermKind };
export type SlotPlacements = Record<string, TermPlacement>;

export function termLabelFor(term: TermKind): string {
  if (term === "summer") return "Summer";
  return term === 1 ? "1st term" : "2nd term";
}

export function termSortKey(term: TermKind): number {
  if (term === 1) return 1;
  if (term === 2) return 2;
  return 3;
}

export function samePlacement(a: TermPlacement, b: TermPlacement): boolean {
  return a.year === b.year && a.term === b.term;
}

/** Effective location: explicit placement, else pattern default, else null (UC/free pool). */
export function effectivePlacement(
  slot: PlanSlot,
  placements: SlotPlacements,
): TermPlacement | null {
  if (placements[slot.id]) return placements[slot.id];
  if (slot.year != null && slot.term != null) {
    return { year: slot.year, term: slot.term };
  }
  return null;
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
    ucGroup: t.group,
    suggestedCode: t.suggestedCode,
    suggestedTitle: t.suggestedTitle,
    hint: t.hint,
    units: t.defaultUnits,
  }));
}

/** Extra major-elective slot students add beyond the recommended pattern. */
export function createExtraElectiveSlot(
  year: number,
  term: TermKind,
): PlanSlot {
  return {
    id: `el-extra-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind: "elective",
    year,
    term,
    termLabel: termLabelFor(term),
    role: ROLE_LABELS["major-elective"],
    roleTag: "major-elective",
    units: 3,
  };
}

export function isExtraElectiveSlot(slotId: string): boolean {
  return slotId.startsWith("el-extra-");
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

export interface TermGroup {
  key: string;
  year: number;
  term: TermKind;
  label: string;
  majorSlots: PlanSlot[];
  manualSlots: PlanSlot[];
}

/** Build timeline rows including optional Summers and moved destinations. */
export function buildTermGroups(
  majorSlots: PlanSlot[],
  manualSlots: PlanSlot[],
  placements: SlotPlacements,
  summerYears: number[],
): TermGroup[] {
  const keys = new Map<string, TermPlacement>();

  for (const slot of majorSlots) {
    const place = effectivePlacement(slot, placements);
    if (!place) continue;
    keys.set(`${place.year}-${place.term}`, place);
  }
  for (const slot of manualSlots) {
    const place = placements[slot.id];
    if (!place) continue;
    keys.set(`${place.year}-${place.term}`, place);
  }
  for (const year of summerYears) {
    keys.set(`${year}-summer`, { year, term: "summer" });
  }

  const groups: TermGroup[] = [...keys.values()]
    .sort((a, b) => a.year - b.year || termSortKey(a.term) - termSortKey(b.term))
    .map((place) => ({
      key: `${place.year}-${place.term}`,
      year: place.year,
      term: place.term,
      label: termLabelFor(place.term),
      majorSlots: majorSlots.filter((slot) => {
        const p = effectivePlacement(slot, placements);
        return p != null && samePlacement(p, place);
      }),
      manualSlots: manualSlots.filter((slot) => {
        const p = placements[slot.id];
        return p != null && samePlacement(p, place);
      }),
    }));

  return groups;
}

export function placementOptions(
  summerYears: number[],
  extraYears: number[] = [1, 2, 3, 4],
): TermPlacement[] {
  const years = [...new Set([...extraYears, ...summerYears])].sort((a, b) => a - b);
  const out: TermPlacement[] = [];
  for (const year of years) {
    out.push({ year, term: 1 });
    out.push({ year, term: 2 });
    if (summerYears.includes(year)) {
      out.push({ year, term: "summer" });
    }
  }
  return out;
}
