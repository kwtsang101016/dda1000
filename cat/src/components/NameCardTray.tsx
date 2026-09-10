import type { DisplayPerson } from "../lib/people.ts";
import { NameCard } from "./NameCard.tsx";

interface NameCardTrayProps {
  advisors: DisplayPerson[];
  peerAdvisors: DisplayPerson[];
  students: DisplayPerson[];
  query: string;
  selectedId: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (personId: string) => void;
  onEdit: (personId: string) => void;
}

export function NameCardTray({
  advisors,
  peerAdvisors,
  students,
  query,
  selectedId,
  onQueryChange,
  onSelect,
  onEdit,
}: NameCardTrayProps) {
  const total = advisors.length + peerAdvisors.length + students.length;

  return (
    <aside className="tray">
      <div className="tray__header">
        <h2>Name cards</h2>
        <p>{total} waiting</p>
      </div>
      <p className="tray__hint">
        Tap a card, then a seat. You will enter your student ID (not shown on cards). Double-tap to
        stand up. Press and hold a seat for photo and details.
      </p>
      <label className="tray__search">
        <span>Find your name</span>
        <input
          type="search"
          value={query}
          placeholder="Name"
          onChange={(event) => onQueryChange(event.target.value)}
          autoComplete="off"
        />
      </label>
      <TrayGroup
        title="Academic advisor"
        people={advisors}
        query={query}
        selectedId={selectedId}
        onSelect={onSelect}
        onEdit={onEdit}
      />
      <TrayGroup
        title="Peer advisors"
        people={peerAdvisors}
        query={query}
        selectedId={selectedId}
        onSelect={onSelect}
        onEdit={onEdit}
      />
      <TrayGroup
        title="Students"
        people={students}
        query={query}
        selectedId={selectedId}
        onSelect={onSelect}
        onEdit={onEdit}
      />
      {total === 0 ? (
        <p className="tray__empty">
          {query.trim() ? "No matching unused cards." : "Everyone is seated."}
        </p>
      ) : null}
    </aside>
  );
}

function TrayGroup({
  title,
  people,
  query,
  selectedId,
  onSelect,
  onEdit,
}: {
  title: string;
  people: DisplayPerson[];
  query: string;
  selectedId: string | null;
  onSelect: (personId: string) => void;
  onEdit: (personId: string) => void;
}) {
  if (people.length === 0) {
    return null;
  }

  return (
    <section className="tray-group">
      <h3>
        {title}
        <span>{people.length}</span>
      </h3>
      <div className="tray-group__cards">
        {people.map((person) => {
          const selected = selectedId === person.id;
          return (
            <div key={person.id} className={["tray-card", selected ? "tray-card--selected" : ""].filter(Boolean).join(" ")}>
              <button
                type="button"
                className="name-card-handle"
                onClick={() => onSelect(person.id)}
                aria-pressed={selected}
                aria-label={`Select ${person.name}`}
              >
                <NameCard
                  person={person}
                  selected={selected}
                  highlighted={query.trim().length > 0}
                />
              </button>
              <button type="button" className="tray-card__edit" onClick={() => onEdit(person.id)}>
                Edit
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
