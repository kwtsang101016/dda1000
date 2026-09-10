import { useDroppable } from "@dnd-kit/core";
import type { Person } from "../../shared/types.ts";
import { DraggableNameCard } from "./NameCard.tsx";

interface NameCardTrayProps {
  advisors: Person[];
  peerAdvisors: Person[];
  students: Person[];
  query: string;
  onQueryChange: (value: string) => void;
}

export function NameCardTray({
  advisors,
  peerAdvisors,
  students,
  query,
  onQueryChange,
}: NameCardTrayProps) {
  const { isOver, setNodeRef } = useDroppable({ id: "tray" });
  const total = advisors.length + peerAdvisors.length + students.length;

  return (
    <aside className={["tray", isOver ? "tray--over" : ""].filter(Boolean).join(" ")} ref={setNodeRef}>
      <div className="tray__header">
        <h2>Name cards</h2>
        <p>{total} waiting to sit</p>
      </div>
      <label className="tray__search">
        <span>Find your name</span>
        <input
          type="search"
          value={query}
          placeholder="Name or student ID"
          onChange={(event) => onQueryChange(event.target.value)}
          autoComplete="off"
        />
      </label>
      <TrayGroup title="Academic advisor" people={advisors} query={query} />
      <TrayGroup title="Peer advisors" people={peerAdvisors} query={query} />
      <TrayGroup title="Students" people={students} query={query} />
      {total === 0 ? (
        <p className="tray__empty">
          {query.trim() ? "No matching unused cards." : "Everyone is seated."}
        </p>
      ) : null}
    </aside>
  );
}

function TrayGroup({ title, people, query }: { title: string; people: Person[]; query: string }) {
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
        {people.map((person) => (
          <DraggableNameCard
            key={person.id}
            person={person}
            highlighted={query.trim().length > 0}
          />
        ))}
      </div>
    </section>
  );
}
