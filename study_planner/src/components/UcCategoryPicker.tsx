import { useEffect } from "react";
import { termLabelFor, type PlanSlot, type TermKind } from "../lib/planSlots";
import "./CoursePicker.css";

interface Props {
  year: number;
  term: TermKind;
  options: PlanSlot[];
  onPick: (slotId: string) => void;
  onClose: () => void;
}

export function UcCategoryPicker({ year, term, options, onPick, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="uc-pick-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker__head">
          <div>
            <h2 id="uc-pick-title">Which University Core requirement?</h2>
            <p>
              Year {year} · {termLabelFor(term)}. Pick the requirement bucket this
              course should count toward (not the course subject itself).
            </p>
          </div>
          <div className="picker__head-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <ul className="picker__list">
          {options.length === 0 && (
            <li className="picker__empty">
              All University Core slots are already placed in terms.
            </li>
          )}
          {options.map((slot) => (
            <li key={slot.id}>
              <button
                type="button"
                className="picker__item"
                onClick={() => onPick(slot.id)}
              >
                <span className="picker__code">{slot.category ?? "University Core"}</span>
                <span className="picker__meta">
                  <span className="picker__title">
                    University Core requirement · {slot.units} units
                  </span>
                  <span className="picker__sub">
                    Place this empty slot in Year {year} Term {term}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
