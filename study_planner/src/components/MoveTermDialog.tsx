import { useEffect } from "react";
import {
  placementOptions,
  termLabelFor,
  type TermPlacement,
} from "../lib/planSlots";
import "./CoursePicker.css";

interface Props {
  title: string;
  subtitle?: string;
  current: TermPlacement | null;
  summerYears: number[];
  /** When true, also list Summer for years not yet added (choosing one adds that Summer). */
  allowNewSummer?: boolean;
  onMove: (place: TermPlacement) => void;
  onClose: () => void;
}

export function MoveTermDialog({
  title,
  subtitle,
  current,
  summerYears,
  allowNewSummer = true,
  onMove,
  onClose,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const summers = allowNewSummer
    ? [...new Set([...summerYears, 1, 2, 3, 4])]
    : summerYears;
  const options = placementOptions(summers);

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker__head">
          <div>
            <h2 id="move-title">{title}</h2>
            <p>
              {subtitle ??
                "Move this slot to another term without clearing the course."}
              {current
                ? ` Currently: Year ${current.year} · ${termLabelFor(current.term)}.`
                : ""}
            </p>
          </div>
          <div className="picker__head-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <ul className="picker__list">
          {options.map((place) => {
            const active =
              current != null &&
              current.year === place.year &&
              current.term === place.term;
            const summerNew =
              place.term === "summer" && !summerYears.includes(place.year);
            return (
              <li key={`${place.year}-${place.term}`}>
                <button
                  type="button"
                  className={`picker__item${active ? " picker__item--current" : ""}`}
                  disabled={active}
                  onClick={() => onMove(place)}
                >
                  <span className="picker__code">Y{place.year}</span>
                  <span className="picker__meta">
                    <span className="picker__title">
                      {termLabelFor(place.term)}
                      {place.term === "summer" ? " term" : ""}
                    </span>
                    <span className="picker__sub">
                      {active
                        ? "Already here"
                        : summerNew
                          ? "Adds Summer for this year, then moves here"
                          : "Move slot here"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
