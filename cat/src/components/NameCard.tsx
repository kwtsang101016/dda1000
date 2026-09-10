import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Person } from "../../shared/types.ts";

interface NameCardProps {
  person: Person;
  compact?: boolean;
  overlay?: boolean;
  highlighted?: boolean;
}

export function NameCard({ person, compact = false, overlay = false, highlighted = false }: NameCardProps) {
  const roleLabel =
    person.role === "aa" ? "AA" : person.role === "pa" ? (person.leading ? "PA · lead" : "PA") : "Student";

  return (
    <article
      className={[
        "name-card",
        `name-card--${person.role}`,
        compact ? "name-card--compact" : "",
        overlay ? "name-card--overlay" : "",
        highlighted ? "name-card--highlighted" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="name-card__role">{roleLabel}</span>
      <h3 className="name-card__name">{person.name}</h3>
      {person.englishName ? <p className="name-card__english">{person.englishName}</p> : null}
      {person.studentId ? <p className="name-card__meta">{person.studentId}</p> : null}
    </article>
  );
}

interface DraggableNameCardProps {
  person: Person;
  compact?: boolean;
  highlighted?: boolean;
}

export function DraggableNameCard({ person, compact, highlighted }: DraggableNameCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: person.id,
    data: { personId: person.id },
  });

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <button
      type="button"
      className="name-card-handle"
      ref={setNodeRef}
      style={style}
      aria-label={`Move ${person.name}`}
      {...listeners}
      {...attributes}
    >
      <NameCard person={person} compact={compact} highlighted={highlighted} />
    </button>
  );
}
