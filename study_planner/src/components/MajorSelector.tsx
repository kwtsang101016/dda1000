import { FE_STREAM_LABELS, MAJOR_ORDER, MAJORS } from "../data/majors";
import type { FeStreamId, MajorId } from "../data/types";
import "./MajorSelector.css";

interface Props {
  major: MajorId | null;
  feStream: FeStreamId | null;
  onMajorChange: (major: MajorId) => void;
  onFeStreamChange: (stream: FeStreamId) => void;
}

export function MajorSelector({
  major,
  feStream,
  onMajorChange,
  onFeStreamChange,
}: Props) {
  return (
    <section className="section" id="major">
      <div className="section__head">
        <h2>Choose your major</h2>
        <p>
          2026–27 recommended patterns only. Choosing a major (and FE
          specialization) seeds the official pattern — every slot stays editable.
        </p>
      </div>
      <div className="major-grid" role="list">
        {MAJOR_ORDER.map((id) => {
          const info = MAJORS[id];
          const active = major === id;
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              className={`major-card${active ? " major-card--active" : ""}`}
              onClick={() => onMajorChange(id)}
            >
              <span className="major-card__code">{info.shortLabel}</span>
              <span className="major-card__label">{info.label}</span>
              <span className="major-card__meta">
                {info.majorUnits}u major · scheme {info.lastUpdate}
              </span>
            </button>
          );
        })}
      </div>
      {major === "FE" && (
        <div className="fe-stream" role="group" aria-label="FE specialization">
          <h3>FE specialization (required)</h3>
          <p>
            Quantitative Finance and FinTech have different required courses.
            Pick one to seed the matching recommended pattern.
          </p>
          <div className="fe-stream__row">
            {(Object.keys(FE_STREAM_LABELS) as FeStreamId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`fe-stream__btn${feStream === id ? " fe-stream__btn--active" : ""}`}
                onClick={() => onFeStreamChange(id)}
              >
                {FE_STREAM_LABELS[id]}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
