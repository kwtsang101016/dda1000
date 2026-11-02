import { useEffect, useState } from "react";
import type { ManualCourse } from "../data/types";
import type { PlanSlot } from "../lib/planSlots";
import "./ManualCourseForm.css";

interface Props {
  slot: PlanSlot;
  current: ManualCourse | null;
  onSave: (course: ManualCourse) => void;
  onClear?: () => void;
  onMove?: () => void;
  onClose: () => void;
}

export function ManualCourseForm({
  slot,
  current,
  onSave,
  onClear,
  onMove,
  onClose,
}: Props) {
  const [code, setCode] = useState(
    current?.code ?? (slot.kind === "uc" ? (slot.suggestedCode ?? "") : ""),
  );
  const [title, setTitle] = useState(
    current?.title ?? (slot.kind === "uc" ? (slot.suggestedTitle ?? "") : ""),
  );
  const [units, setUnits] = useState(current?.units ?? slot.units);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedCode = code.trim();
    const trimmedTitle = title.trim();
    if (!trimmedCode && !trimmedTitle) return;
    const u = Number(units);
    if (!Number.isFinite(u) || u <= 0) return;
    onSave({
      code: trimmedCode || "MANUAL",
      title: trimmedTitle || trimmedCode || "Manual course",
      units: u,
    });
  }

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="picker manual-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker__head">
          <div>
            <h2 id="manual-title">
              {slot.kind === "uc" ? "University Core course" : "Free elective"}
            </h2>
            <p>
              {slot.kind === "uc" && slot.category
                ? `Counts toward: ${slot.category} (${slot.units}u). Enter the exact course you will take (e.g. replace GEA / PED11XX with a real catalogue code).`
                : `Default ${slot.units} units — enter any course code and title.`}
            </p>
            {slot.kind === "uc" && slot.hint ? (
              <p className="manual-form__hint">{slot.hint}</p>
            ) : null}
          </div>
          <div className="picker__head-actions">
            {onMove && (
              <button type="button" className="btn btn--ghost" onClick={onMove}>
                Move
              </button>
            )}
            {onClear && current && (
              <button type="button" className="btn btn--ghost" onClick={onClear}>
                Clear
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        <form className="manual-form__body" onSubmit={handleSubmit}>
          <label>
            Course code
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={
                slot.kind === "uc"
                  ? slot.suggestedCode ?? "e.g. CHI1000"
                  : "e.g. elective code"
              }
              autoFocus
            />
          </label>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={slot.suggestedTitle ?? "Course title"}
            />
          </label>
          <label>
            Units
            <input
              type="number"
              min={0.5}
              step={0.5}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
            />
          </label>
          <button type="submit" className="btn btn--primary">
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
