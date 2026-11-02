import { UC_SLOT_TEMPLATES, type UcSlotTemplate } from "../data/universityCore";
import type { ManualCourse } from "../data/types";
import {
  effectivePlacement,
  termLabelFor,
  type ManualAssignments,
  type PlanSlot,
  type SlotPlacements,
  type TermKind,
  type TermPlacement,
} from "./planSlots";

export type CheckLevel = "pass" | "fail" | "warn" | "pending";

export interface ValidityCheck {
  id: string;
  label: string;
  detail: string;
  level: CheckLevel;
}

type GeKind = "gef" | "gee" | "other";

function templateFor(slot: PlanSlot): UcSlotTemplate | undefined {
  return UC_SLOT_TEMPLATES.find((t) => t.id === slot.id);
}

function isGeSlot(slot: PlanSlot): boolean {
  const t = templateFor(slot);
  if (!t) return false;
  return t.group.startsWith("General Education");
}

function geKind(slot: PlanSlot): GeKind {
  const code = (templateFor(slot)?.suggestedCode ?? "").toUpperCase();
  if (code === "GFH1000" || code === "GFN1000") return "gef";
  if (code.startsWith("GEA") || code.startsWith("GEB") || code.startsWith("GEC") || code.startsWith("GED")) {
    return "gee";
  }
  return "other";
}

function termKey(p: TermPlacement): string {
  return `${p.year}-${p.term}`;
}

function termSort(a: TermPlacement, b: TermPlacement): number {
  if (a.year !== b.year) return a.year - b.year;
  const order = (t: TermKind) => (t === 1 ? 1 : t === 2 ? 2 : 3);
  return order(a.term) - order(b.term);
}

function formatTerm(p: TermPlacement): string {
  return `Year ${p.year} ${termLabelFor(p.term)}`;
}

function filled(manual: ManualAssignments, id: string): ManualCourse | null {
  return manual[id] ?? null;
}

/**
 * Validate University Core / GE placement rules against the student's plan.
 * Sources: Academic Curriculum 2025–26; GE Study Scheme 2023–24+.
 */
export function analyzeUcGeValidity(options: {
  ucSlots: PlanSlot[];
  manual: ManualAssignments;
  placements: SlotPlacements;
}): ValidityCheck[] {
  const { ucSlots, manual, placements } = options;
  const checks: ValidityCheck[] = [];

  const placed = ucSlots.filter((s) => effectivePlacement(s, placements));
  const unplaced = ucSlots.filter((s) => !effectivePlacement(s, placements));
  const unfilledPlaced = placed.filter((s) => !filled(manual, s.id));
  const filledCount = ucSlots.filter((s) => filled(manual, s.id)).length;

  checks.push({
    id: "uc-complete",
    label: "University Core slots complete",
    detail:
      unplaced.length === 0 && unfilledPlaced.length === 0
        ? `All ${ucSlots.length} UC requirements are on the timeline with a course entered.`
        : [
            unplaced.length > 0
              ? `${unplaced.length} not yet placed: ${unplaced.map((s) => s.category).join("; ")}`
              : null,
            unfilledPlaced.length > 0
              ? `${unfilledPlaced.length} placed but empty: ${unfilledPlaced.map((s) => s.category).join("; ")}`
              : null,
            filledCount > 0 ? `${filledCount} / ${ucSlots.length} have a course code entered.` : null,
          ]
            .filter(Boolean)
            .join(" · "),
    level:
      unplaced.length === 0 && unfilledPlaced.length === 0
        ? "pass"
        : filledCount === 0 && unplaced.length === ucSlots.length
          ? "pending"
          : "fail",
  });

  const geSlots = ucSlots.filter(isGeSlot);
  const gePlaced = geSlots
    .map((slot) => {
      const place = effectivePlacement(slot, placements);
      if (!place) return null;
      return { slot, place, kind: geKind(slot), course: filled(manual, slot.id) };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // --- No GE in Year 1 Term 1 ---
  const y1t1 = gePlaced.filter((g) => g.place.year === 1 && g.place.term === 1);
  checks.push({
    id: "ge-y1t1",
    label: "No University GE in Year 1 Term 1",
    detail:
      y1t1.length === 0
        ? "No GE courses are scheduled in Year 1 Term 1."
        : `Not allowed: ${y1t1.map((g) => g.slot.category).join("; ")} in Year 1 Term 1.`,
    level: y1t1.length === 0 ? (gePlaced.length === 0 ? "pending" : "pass") : "fail",
  });

  // --- Max 2 GE per regular term / Summer ---
  const byTerm = new Map<string, typeof gePlaced>();
  for (const g of gePlaced) {
    const k = termKey(g.place);
    const list = byTerm.get(k) ?? [];
    list.push(g);
    byTerm.set(k, list);
  }

  const overcrowded: string[] = [];
  for (const [, list] of byTerm) {
    if (list.length <= 2) continue;
    const p = list[0].place;
    overcrowded.push(
      `${formatTerm(p)} has ${list.length} GE (${list.map((g) => g.slot.suggestedCode ?? g.slot.category).join(", ")})`,
    );
  }
  checks.push({
    id: "ge-max-two",
    label: "At most 2 University GE courses per term",
    detail:
      overcrowded.length === 0
        ? gePlaced.length === 0
          ? "Place GE courses on terms to validate the ≤2 per Term 1 / Term 2 / Summer rule."
          : "Every scheduled term has at most 2 University GE courses."
        : overcrowded.join(" · "),
    level:
      overcrowded.length > 0 ? "fail" : gePlaced.length === 0 ? "pending" : "pass",
  });

  // --- Per-term mix: 2 GEE only after both GEF finished ---
  const gefSlots = geSlots.filter((s) => geKind(s) === "gef");
  const gefDoneTerms = new Map<string, TermPlacement>();
  for (const slot of gefSlots) {
    const place = effectivePlacement(slot, placements);
    if (place) gefDoneTerms.set(slot.id, place);
  }
  const bothGefPlaced = gefSlots.every((s) => effectivePlacement(s, placements));

  function gefCompletedBefore(term: TermPlacement): boolean {
    if (!bothGefPlaced) return false;
    return gefSlots.every((s) => {
      const p = effectivePlacement(s, placements);
      if (!p) return false;
      return termSort(p, term) < 0;
    });
  }

  const mixViolations: string[] = [];
  for (const [, list] of byTerm) {
    if (list.length < 2) continue;
    const p = list[0].place;
    const gefHere = list.filter((g) => g.kind === "gef").length;
    const geeHere = list.filter((g) => g.kind === "gee").length;
    if (geeHere === 2 && gefHere === 0 && !gefCompletedBefore(p)) {
      mixViolations.push(
        `${formatTerm(p)}: two Area electives (GEE) before both GFH1000 and GFN1000 are finished — take one GEF + one GEE, or finish both foundations first.`,
      );
    }
  }
  checks.push({
    id: "ge-gef-before-two-gee",
    label: "GE mix per term (GEF before two Area electives)",
    detail:
      mixViolations.length === 0
        ? gePlaced.length < 2
          ? "When two GE sit in one term: either one foundation + one Area elective, or two Area electives only after both foundations are done."
          : "Term GE combinations match the enrolment rule."
        : mixViolations.join(" · "),
    level:
      mixViolations.length > 0
        ? "fail"
        : gePlaced.length < 2
          ? "pending"
          : "pass",
  });

  // --- GEF both recommended before Year 3 ---
  const lateGef = gefSlots.filter((s) => {
    const p = effectivePlacement(s, placements);
    return p != null && p.year >= 3;
  });
  checks.push({
    id: "ge-gef-before-y3",
    label: "GE foundations before Year 3 (recommended)",
    detail:
      lateGef.length === 0
        ? gefSlots.every((s) => effectivePlacement(s, placements))
          ? "Both GFH1000 and GFN1000 are scheduled before Year 3."
          : "Recommended: finish GFH1000 and GFN1000 before the start of Year 3."
        : `Scheduled in Year 3+: ${lateGef.map((s) => s.category).join("; ")}. Aim to finish both foundations earlier.`,
    level:
      lateGef.length > 0
        ? "warn"
        : gefSlots.every((s) => effectivePlacement(s, placements))
          ? "pass"
          : "pending",
  });

  // --- Areas A–D + both foundations represented as distinct slots ---
  const areaIds = ["uc-ge-1", "uc-ge-2", "uc-ge-3", "uc-ge-4", "uc-ge-5", "uc-ge-6"];
  const areaMissing = areaIds
    .map((id) => ucSlots.find((s) => s.id === id))
    .filter((s): s is PlanSlot => Boolean(s))
    .filter((s) => !filled(manual, s.id));
  checks.push({
    id: "ge-areas",
    label: "GE 18u coverage (GFH, GFN, GEA–GED)",
    detail:
      areaMissing.length === 0
        ? "Both foundations and one course from each of Areas A–D have course entries."
        : `Still need course entries for: ${areaMissing.map((s) => s.category).join("; ")}.`,
    level: areaMissing.length === 0 ? "pass" : "pending",
  });

  // --- DAI1000 in Year 1 (recommended / required unless exempted) ---
  const dai = ucSlots.find((s) => s.id === "uc-dai");
  if (dai) {
    const p = effectivePlacement(dai, placements);
    const hasCourse = Boolean(filled(manual, dai.id));
    let level: CheckLevel = "pending";
    let detail = "Unless exempted, register DAI1000 in the first year of attendance.";
    if (p && hasCourse) {
      if (p.year === 1) {
        level = "pass";
        detail = `DAI1000 planned in ${formatTerm(p)}.`;
      } else {
        level = "warn";
        detail = `DAI1000 is in ${formatTerm(p)} — curriculum expects Year 1 unless exempted.`;
      }
    } else if (p && !hasCourse) {
      level = "warn";
      detail = `DAI1000 slot is in ${formatTerm(p)} but has no course entry yet.`;
    }
    checks.push({
      id: "dai-y1",
      label: "DAI1000 in Year 1 (unless exempted)",
      detail,
      level,
    });
  }

  // --- PE series shape (soft): PED11 / PED12 when codes entered ---
  const pe11 = ucSlots.find((s) => s.id === "uc-pe-1");
  const pe12 = ucSlots.find((s) => s.id === "uc-pe-2");
  if (pe11 && pe12) {
    const c11 = filled(manual, pe11.id)?.code.trim().toUpperCase() ?? "";
    const c12 = filled(manual, pe12.id)?.code.trim().toUpperCase() ?? "";
    const peIssues: string[] = [];
    if (c11 && !/^PED11\d{2}$/.test(c11) && c11 !== "PED11XX") {
      peIssues.push(`${c11} may not be a PED11XX Physical Education course`);
    }
    if (c12 && !/^PED12\d{2}$/.test(c12) && c12 !== "PED12XX") {
      peIssues.push(`${c12} may not be a PED12XX Fitness and Health course`);
    }
    checks.push({
      id: "pe-series",
      label: "PE & Health series (PED11XX + PED12XX)",
      detail:
        peIssues.length > 0
          ? peIssues.join(" · ")
          : c11 && c12
            ? `Physical Education ${c11} and Fitness & Health ${c12} look correctly series-tagged.`
            : "Enter one PED11XX and one PED12XX course (replace the placeholders).",
      level:
        peIssues.length > 0
          ? "warn"
          : c11 && c12
            ? "pass"
            : "pending",
    });
  }

  return checks;
}

export function validitySummary(checks: ValidityCheck[]): {
  fails: number;
  warns: number;
  pending: number;
  passes: number;
} {
  return {
    fails: checks.filter((c) => c.level === "fail").length,
    warns: checks.filter((c) => c.level === "warn").length,
    pending: checks.filter((c) => c.level === "pending").length,
    passes: checks.filter((c) => c.level === "pass").length,
  };
}
