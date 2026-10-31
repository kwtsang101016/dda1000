import { useMemo, useRef } from "react";
import { MAJORS } from "../data/majors";
import type { FeStreamId, MajorId, ManualCourse } from "../data/types";
import { getCourse } from "../lib/courseUtils";
import {
  type ManualAssignments,
  type PlanAssignments,
  type PlanSlot,
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
  onSelectSlot: (slotId: string) => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
  onReseed: () => void;
  onAddFreeSlot: () => void;
  onRemoveFreeSlot: (slotId: string) => void;
}

function groupMajorByTerm(slots: PlanSlot[]) {
  const groups: {
    key: string;
    year: number;
    term: 1 | 2;
    label: string;
    slots: PlanSlot[];
  }[] = [];
  for (const slot of slots) {
    if (slot.year == null || slot.term == null) continue;
    const key = `${slot.year}-${slot.term}`;
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = {
        key,
        year: slot.year,
        term: slot.term,
        label: slot.termLabel ?? "",
        slots: [],
      };
      groups.push(group);
    }
    group.slots.push(slot);
  }
  return groups;
}

export function CoursePattern({
  major,
  feStream,
  majorSlots,
  ucSlots,
  freeSlots,
  assignments,
  manual,
  onSelectSlot,
  onExport,
  onImportFile,
  onReseed,
  onAddFreeSlot,
  onRemoveFreeSlot,
}: CoursePatternProps) {
  const groups = useMemo(() => groupMajorByTerm(majorSlots), [majorSlots]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const info = MAJORS[major];

  function termUnits(termSlots: PlanSlot[]): number {
    return termSlots.reduce((sum, slot) => {
      const code = assignments[slot.id];
      if (!code) return sum;
      return sum + (getCourse(code)?.units ?? slot.units);
    }, 0);
  }

  function manualLabel(slot: PlanSlot, course: ManualCourse | null | undefined) {
    if (course) return null;
    if (slot.kind === "uc") {
      return `Add ${slot.category ?? "University Core"}…`;
    }
    return "Add free elective…";
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
            . Every slot is clickable — replace catalogue courses or fill University
            Core and Free Electives manually.
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

      <div className="pattern-timeline">
        {groups.map((group, index) => {
          const yearLabel =
            index === 0 || groups[index - 1]?.year !== group.year
              ? `Year ${group.year}`
              : null;
          const hasElective = group.slots.some((s) => s.kind === "elective");
          const units = termUnits(group.slots);

          return (
            <div key={group.key}>
              {yearLabel && <div className="pattern-year">{yearLabel}</div>}
              <div
                className={`pattern-row${hasElective ? " pattern-row--elective" : ""}`}
              >
                <div className="pattern-row__term">
                  Term {group.term} · {group.label}
                </div>
                <div className="pattern-row__body">
                  <div className="course-card-grid">
                    {group.slots.map((slot) => {
                      const code = assignments[slot.id] ?? null;
                      return (
                        <CourseInfoCard
                          key={slot.id}
                          code={code}
                          fallbackRole={slot.role}
                          selectable
                          emptyLabel={
                            slot.options && slot.options.length > 1
                              ? `Choose: ${slot.options.join(" or ")}`
                              : "Click to choose elective…"
                          }
                          onClick={() => onSelectSlot(slot.id)}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="pattern-row__units">{units} u</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pattern-year">University Core</div>
      <div className="pattern-row">
        <div className="pattern-row__term">36 units</div>
        <div className="pattern-row__body">
          <div className="course-card-grid">
            {ucSlots.map((slot) => {
              const course = manual[slot.id] ?? null;
              return (
                <CourseInfoCard
                  key={slot.id}
                  manual={course}
                  fallbackRole={slot.category ?? slot.role}
                  selectable
                  emptyLabel={manualLabel(slot, course) ?? undefined}
                  onClick={() => onSelectSlot(slot.id)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="pattern-year">Free Electives</div>
      <div className="pattern-row">
        <div className="pattern-row__term">To 120</div>
        <div className="pattern-row__body">
          <div className="course-card-grid">
            {freeSlots.map((slot) => {
              const course = manual[slot.id] ?? null;
              return (
                <div key={slot.id} className="free-slot-wrap">
                  <CourseInfoCard
                    manual={course}
                    fallbackRole={slot.role}
                    selectable
                    emptyLabel={manualLabel(slot, course) ?? undefined}
                    onClick={() => onSelectSlot(slot.id)}
                  />
                  {freeSlots.length > 1 && (
                    <button
                      type="button"
                      className="free-slot-remove"
                      onClick={() => onRemoveFreeSlot(slot.id)}
                      aria-label="Remove free elective slot"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <button type="button" className="btn btn--ghost free-add" onClick={onAddFreeSlot}>
            Add free elective slot
          </button>
        </div>
      </div>

      <p className="pattern-footnote">
        Major requirement (including school package):{" "}
        <strong>{info.majorUnits} units</strong> · Graduation total:{" "}
        <strong>120 units</strong>
      </p>
    </section>
  );
}
