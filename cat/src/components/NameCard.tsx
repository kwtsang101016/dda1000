import type { DisplayPerson } from "../lib/people.ts";

interface NameCardProps {
  person: DisplayPerson;
  compact?: boolean;
  enlarged?: boolean;
  selected?: boolean;
  highlighted?: boolean;
}

export function NameCard({
  person,
  compact = false,
  enlarged = false,
  selected = false,
  highlighted = false,
}: NameCardProps) {
  const roleLabel =
    person.role === "aa" ? "AA" : person.role === "pa" ? (person.leading ? "PA · lead" : "PA") : "Student";

  return (
    <article
      className={[
        "name-card",
        `name-card--${person.role}`,
        compact ? "name-card--compact" : "",
        enlarged ? "name-card--enlarged" : "",
        selected ? "name-card--selected" : "",
        highlighted ? "name-card--highlighted" : "",
        person.displayPhoto ? "name-card--has-photo" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {person.displayPhoto ? (
        <img className="name-card__photo" src={person.displayPhoto} alt="" draggable={false} />
      ) : null}
      <div className="name-card__body">
        <span className="name-card__role">{roleLabel}</span>
        <h3 className="name-card__name">{person.name}</h3>
        {person.englishName && !compact ? (
          <p className="name-card__english">{person.englishName}</p>
        ) : null}
        {compact ? null : (
          <>
            {person.studentId ? <p className="name-card__meta">{person.studentId}</p> : null}
            {person.displayCollege ? <p className="name-card__meta">{person.displayCollege}</p> : null}
            {person.displayCountry ? <p className="name-card__meta">{person.displayCountry}</p> : null}
            {person.displayHobbies ? <p className="name-card__meta">{person.displayHobbies}</p> : null}
          </>
        )}
        {compact && (person.displayCollege || person.displayCountry) ? (
          <p className="name-card__meta name-card__meta--tight">
            {[person.displayCollege, person.displayCountry].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </article>
  );
}
