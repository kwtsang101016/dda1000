import { STREAM_COLORS, STREAM_LABELS } from "../data/streams";
import type { StreamTag } from "../data/types";
import { getCourse } from "../lib/courseUtils";
import "./CourseInfoCard.css";

interface Props {
  code?: string | null;
  /** Manual slot filled course. */
  manual?: { code: string; title: string; units: number } | null;
  fallbackRole?: string;
  emptyLabel?: string;
  selectable?: boolean;
  onClick?: () => void;
}

export function CourseInfoCard({
  code,
  manual,
  fallbackRole,
  emptyLabel = "Click to choose…",
  selectable = false,
  onClick,
}: Props) {
  if (manual) {
    const body = (
      <>
        <div className="course-card__top">
          <span className="course-card__code">{manual.code || "—"}</span>
          <span className="course-card__units">{manual.units}u</span>
        </div>
        <p className="course-card__title">{manual.title || "Untitled"}</p>
        {fallbackRole && (
          <div className="course-card__streams">
            <span className="stream-chip stream-chip--muted">{fallbackRole}</span>
          </div>
        )}
        {selectable && <span className="course-card__hint">Click to edit</span>}
      </>
    );
    if (selectable) {
      return (
        <button type="button" className="course-card course-card--selectable" onClick={onClick}>
          {body}
        </button>
      );
    }
    return <article className="course-card">{body}</article>;
  }

  if (!code) {
    if (selectable) {
      return (
        <button
          type="button"
          className="course-card course-card--empty course-card--selectable"
          onClick={onClick}
        >
          <p className="course-card__empty">{emptyLabel}</p>
        </button>
      );
    }
    return (
      <article className="course-card course-card--empty">
        <p className="course-card__empty">{emptyLabel}</p>
      </article>
    );
  }

  const course = getCourse(code);
  const title = course?.title ?? "Unknown course";
  const streams = course?.streams ?? [];
  const units = course?.units ?? 3;

  const body = (
    <>
      <div className="course-card__top">
        <span className="course-card__code">{code}</span>
        <span className="course-card__units">{units}u</span>
      </div>
      <p className="course-card__title">{title}</p>
      {course?.statusNote && <p className="course-card__note">{course.statusNote}</p>}
      <div className="course-card__streams">
        {streams.length > 0
          ? streams.map((id) => (
              <span
                key={id}
                className="stream-chip"
                style={{
                  background: `${STREAM_COLORS[id as StreamTag]}22`,
                  borderColor: `${STREAM_COLORS[id as StreamTag]}66`,
                  color: STREAM_COLORS[id as StreamTag],
                }}
              >
                {STREAM_LABELS[id as StreamTag] ?? id}
              </span>
            ))
          : fallbackRole && (
              <span className="stream-chip stream-chip--muted">{fallbackRole}</span>
            )}
      </div>
      {selectable && <span className="course-card__hint">Click to change</span>}
    </>
  );

  if (selectable) {
    return (
      <button type="button" className="course-card course-card--selectable" onClick={onClick}>
        {body}
      </button>
    );
  }

  return <article className="course-card">{body}</article>;
}
