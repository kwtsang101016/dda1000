import { useMemo, useRef } from "react";
import { MAJORS, UNIVERSITY_CORE_UNITS, freeElectiveUnits } from "../data/majors";
import type { FeStreamId, MajorId, ManualCourse } from "../data/types";
import { getCourse } from "../lib/courseUtils";
import {
  buildTermGroups,
  isExtraElectiveSlot,
  type ManualAssignments,
  type PlanAssignments,
  type PlanSlot,
  type SlotPlacements,
  type TermKind,
} from "../lib/planSlots";
import { CourseInfoCard } from "./CourseInfoCard";
import "./CoursePattern.css";

interface CoursePatternProps {
  major: MajorId;
  feStream: FeStreamId | null;
  majorSlots: PlanSlot[];
  ucSlots: PlanSlot[];
  freeSlots: PlanSlot[];
  assignments: PlanAssignments;
  manual: ManualAssignments;
  placements: SlotPlacements;
  summerYears: number[];
  onSelectSlot: (slotId: string) => void;
  onRequestMove: (slotId: string) => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onReseed: () => void;
  onRemoveFreeSlot: (slotId: string) => void;
  onRequestPlaceUc: (year: number, term: TermKind) => void;
  onAddMajorElective: (year: number, term: TermKind) => void;
  onRemoveElectiveSlot: (slotId: string) => void;
  onPlaceFreeInTerm: (year: number, term: TermKind) => void;
  onUnplaceSlot: (slotId: string) => void;
  onAddSummer: (year: number) => void;
  onRemoveSummer: (year: number) => void;
}

export function CoursePattern({
  major,
  feStream,
  majorSlots,
  ucSlots,
  freeSlots,
  assignments,
  manual,
  placements,
  summerYears,
  onSelectSlot,
  onRequestMove,
  onExport,
  onImportFile,
  onReseed,
  onRemoveFreeSlot,
  onRequestPlaceUc,
  onAddMajorElective,
  onRemoveElectiveSlot,
  onPlaceFreeInTerm,
  onUnplaceSlot,
  onAddSummer,
  onRemoveSummer,
}: CoursePatternProps) {
  const manualPool = useMemo(() => [...ucSlots, ...freeSlots], [ucSlots, freeSlots]);
  const groups = useMemo(
    () => buildTermGroups(majorSlots, manualPool, placements, summerYears),
    [majorSlots, manualPool, placements, summerYears],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const info = MAJORS[major];

  const unplacedUc = ucSlots.filter((s) => !placements[s.id]);
  const unplacedFree = freeSlots.filter((s) => !placements[s.id]);
  const canPlaceUc = unplacedUc.length > 0;
  const freeTarget = freeElectiveUnits(major);

  const yearsInPlan = useMemo(() => {
    const set = new Set<number>([1, 2, 3, 4]);
    for (const g of groups) set.add(g.year);
    return [...set].sort((a, b) => a - b);
  }, [groups]);

  function termUnits(group: {
    year: number;
    term: TermKind;
    majorSlots: PlanSlot[];
    manualSlots: PlanSlot[];
  }): number {
    let sum = group.majorSlots.reduce((acc, slot) => {
      const code = assignments[slot.id];
      if (!code) return acc;
      return acc + (getCourse(code)?.units ?? slot.units);
    }, 0);
    for (const slot of group.manualSlots) {
      sum += manual[slot.id]?.units ?? 0;
    }
    return sum;
  }

  function ucRequirementLabel(slot: PlanSlot): string {
    return slot.category
      ? `UC requirement · ${slot.category}`
      : "University Core";
  }

  function manualLabel(slot: PlanSlot, course: ManualCourse | null | undefined) {
    if (course) return null;
    if (slot.kind === "uc") {
      return `Fill ${ucRequirementLabel(slot)}…`;
    }
    return "Add free elective…";
  }

  function renderManualSlot(slot: PlanSlot) {
    const course = manual[slot.id] ?? null;
    return (
      <div key={slot.id} className="free-slot-wrap">
        <CourseInfoCard
          manual={course}
          fallbackRole={
            slot.kind === "uc" ? ucRequirementLabel(slot) : (slot.category ?? slot.role)
          }
          selectable
          emptyLabel={manualLabel(slot, course) ?? undefined}
          onClick={() => onSelectSlot(slot.id)}
        />
        <div className="slot-actions">
          <button
            type="button"
            className="free-slot-remove"
            onClick={() => onRequestMove(slot.id)}
          >
            Move
          </button>
          {slot.kind === "free" ? (
            <button
              type="button"
              className="free-slot-remove"
              onClick={() => onRemoveFreeSlot(slot.id)}
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              className="free-slot-remove"
              onClick={() => onUnplaceSlot(slot.id)}
            >
              Remove from term
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderMajorSlot(slot: PlanSlot) {
    const code = assignments[slot.id] ?? null;
    return (
      <div key={slot.id} className="free-slot-wrap">
        <CourseInfoCard
          code={code}
          major={major}
          fallbackRole={slot.role}
          selectable
          emptyLabel={
            slot.options && slot.options.length > 1
              ? `Choose: ${slot.options.join(" or ")}`
              : "Click to choose elective…"
          }
          onClick={() => onSelectSlot(slot.id)}
        />
        <div className="slot-actions">
          <button
            type="button"
            className="free-slot-remove"
            onClick={() => onRequestMove(slot.id)}
          >
            Move
          </button>
          {isExtraElectiveSlot(slot.id) && (
            <button
              type="button"
              className="free-slot-remove"
              onClick={() => onRemoveElectiveSlot(slot.id)}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className="section plan-board" id="pattern">
      <div className="section__head section__head--row">
        <div>
          <h2>Your plan</h2>
          <p>
            Seeded from the official 2026–27 pattern for{" "}
            <strong>{info.shortLabel}</strong>
            {major === "FE" && feStream
              ? ` (${feStream === "qf" ? "Quantitative Finance" : "FinTech"})`
              : ""}
            . Add University Core, major electives, or free electives on a term,
            then use <strong>Move</strong> to reshuffle. Summer is optional.
          </p>
        </div>
        <div className="plan-actions">
          <button type="button" className="btn btn--ghost" onClick={onReseed}>
            Reset major pattern
          </button>
          <button type="button" className="btn btn--ghost" onClick={onExport}>
            Export plan
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            Import plan
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="plan-file-input"
            aria-label="Import plan JSON file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onImportFile(file);
            }}
          />
        </div>
      </div>

      <div className="summer-toolbar">
        <span className="summer-toolbar__label">Optional Summer:</span>
        {yearsInPlan.map((year) => {
          const has = summerYears.includes(year);
          return (
            <button
              key={year}
              type="button"
              className="btn btn--ghost term-add"
              onClick={() => (has ? onRemoveSummer(year) : onAddSummer(year))}
              title={
                has
                  ? "Remove Summer for this year (only if empty)"
                  : "Show a Summer row for this year"
              }
            >
              {has ? `Remove Y${year} Summer` : `Add Y${year} Summer`}
            </button>
          );
        })}
      </div>

      <div className="pattern-timeline">
        {groups.map((group, index) => {
          const yearLabel =
            index === 0 || groups[index - 1]?.year !== group.year
              ? `Year ${group.year}`
              : null;
          const hasElective = group.majorSlots.some((s) => s.kind === "elective");
          const units = termUnits(group);
          const isSummer = group.term === "summer";

          return (
            <div key={group.key}>
              {yearLabel && <div className="pattern-year">{yearLabel}</div>}
              <div
                className={`pattern-row${hasElective ? " pattern-row--elective" : ""}${
                  isSummer ? " pattern-row--summer" : ""
                }`}
              >
                <div className="pattern-row__term">
                  {isSummer ? "Summer" : `Term ${group.term}`} · {group.label}
                </div>
                <div className="pattern-row__body">
                  <div className="course-card-grid">
                    {group.majorSlots.map((slot) => renderMajorSlot(slot))}
                    {group.manualSlots.map((slot) => renderManualSlot(slot))}
                  </div>
                  {group.majorSlots.length === 0 && group.manualSlots.length === 0 && (
                    <p className="pattern-placeholder">
                      No courses here yet — move a course in, or add University Core /
                      major elective / free elective.
                    </p>
                  )}
                  <div className="term-add-row">
                    <button
                      type="button"
                      className="btn btn--ghost term-add"
                      disabled={!canPlaceUc}
                      title={
                        canPlaceUc
                          ? `${unplacedUc.length} University Core requirement(s) left to place`
                          : "All University Core requirements are already on the timeline"
                      }
                      onClick={() => onRequestPlaceUc(group.year, group.term)}
                    >
                      Add University Core
                      {canPlaceUc ? ` (${unplacedUc.length} left)` : ""}
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost term-add"
                      title="Add an extra major elective beyond the recommended pattern"
                      onClick={() => onAddMajorElective(group.year, group.term)}
                    >
                      Add Major Elective
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost term-add"
                      onClick={() => onPlaceFreeInTerm(group.year, group.term)}
                    >
                      Add free elective
                      {unplacedFree.length > 0
                        ? ` (${unplacedFree.length} left)`
                        : ""}
                    </button>
                  </div>
                </div>
                <div className="pattern-row__units">{units} u</div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="pattern-footnote">
        Major {info.majorUnits}u · University Core {UNIVERSITY_CORE_UNITS}u (
        {unplacedUc.length} requirement
        {unplacedUc.length === 1 ? "" : "s"} not yet on a term) · Free electives{" "}
        {freeTarget}u · Graduation <strong>120</strong> units
      </p>
    </section>
  );
}
