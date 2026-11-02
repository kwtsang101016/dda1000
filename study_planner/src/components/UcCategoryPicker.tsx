import { useEffect, useMemo } from "react";
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

  const grouped = useMemo(() => {
    const map = new Map<string, PlanSlot[]>();
    for (const slot of options) {
      const key = slot.ucGroup ?? "University Core";
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [options]);

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
              Year {year} · {termLabelFor(term)}. Pick the official UC / GE bucket
              this course should count toward (2025–26 curriculum).
            </p>
          </div>
          <div className="picker__head-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        {options.length === 0 ? (
          <ul className="picker__list">
            <li className="picker__empty">
              All University Core slots are already placed in terms.
            </li>
          </ul>
        ) : (
          <div className="picker__list uc-pick-groups">
            {grouped.map(([group, slots]) => (
              <section key={group} className="uc-pick-group">
                <h3 className="uc-pick-group__title">{group}</h3>
                <ul className="picker__list">
                  {slots.map((slot) => (
                    <li key={slot.id}>
                      <button
                        type="button"
                        className="picker__item"
                        onClick={() => onPick(slot.id)}
                      >
                        <span className="picker__code">
                          {slot.suggestedCode ?? slot.category ?? "UC"}
                        </span>
                        <span className="picker__meta">
                          <span className="picker__title">
                            {slot.category ?? "University Core"} · {slot.units}u
                          </span>
                          <span className="picker__sub">
                            {slot.hint ??
                              `Place this empty slot in Year ${year} · ${termLabelFor(term)}`}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
