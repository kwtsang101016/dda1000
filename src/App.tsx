import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState, type ReactNode } from "react";
import rosterData from "./data/roster.json" with { type: "json" };
import { NameCard } from "./components/NameCard.tsx";
import { NameCardTray } from "./components/NameCardTray.tsx";
import { Seat } from "./components/Seat.tsx";
import { useClassroomSync } from "./lib/useClassroomSync.ts";
import {
  MAX_SEATS_PER_ROW,
  MAX_STUDENT_ROWS,
  MIN_SEATS_PER_ROW,
  MIN_STUDENT_ROWS,
  occupantAt,
  parseSeatKey,
  seatKey,
} from "../shared/seating.ts";
import type { Person, Roster } from "../shared/types.ts";

const roster = rosterData as Roster;

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) {
    return pointerHits;
  }
  return closestCenter(args);
};

function matchesQuery(person: Person, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return (
    person.name.toLowerCase().includes(needle) ||
    person.englishName.toLowerCase().includes(needle) ||
    person.studentId.toLowerCase().includes(needle)
  );
}

function byChineseName(a: Person, b: Person): number {
  return a.name.localeCompare(b.name, "zh-CN");
}

export default function App() {
  const sync = useClassroomSync();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const peopleById = useMemo(
    () => Object.fromEntries(roster.people.map((person) => [person.id, person])),
    [],
  );

  const seatedIds = useMemo(() => new Set(Object.keys(sync.state.placements)), [sync.state.placements]);
  const seatedCount = roster.people.filter((person) => seatedIds.has(person.id)).length;

  const unseated = useMemo(
    () =>
      roster.people
        .filter((person) => !seatedIds.has(person.id) && matchesQuery(person, query))
        .sort(byChineseName),
    [query, seatedIds],
  );

  const advisors = unseated.filter((person) => person.role === "aa");
  const peerAdvisors = unseated.filter((person) => person.role === "pa");
  const students = unseated.filter((person) => person.role === "student");
  const activePerson = activeId ? peopleById[activeId] : undefined;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const personId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    setActiveId(null);

    if (!overId) {
      return;
    }
    if (overId === "tray") {
      sync.unseat(personId);
      return;
    }
    const target = parseSeatKey(overId);
    if (!target) {
      return;
    }
    sync.place(personId, target);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleReset = () => {
    const confirmed = window.confirm("Return every name card to the side tray?");
    if (confirmed) {
      sync.reset();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="page">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {roster.course} · {roster.section}
            </p>
            <h1>Class Attending Table</h1>
            <p className="subtitle">
              曾家炜 · Ka Wai Tsang · {roster.classroom}
            </p>
          </div>
          <div className="topbar__meta">
            <StatusPill status={sync.status} connectedCount={sync.connectedCount} />
            <p className="seated-count">
              {seatedCount} / {roster.people.length} seated
            </p>
          </div>
        </header>

        {sync.errorMessage ? (
          <button type="button" className="banner banner--error" onClick={sync.clearError}>
            {sync.errorMessage} — tap to dismiss
          </button>
        ) : null}

        <section className="controls" aria-label="Table layout">
          <label>
            Student rows
            <input
              type="number"
              min={MIN_STUDENT_ROWS}
              max={MAX_STUDENT_ROWS}
              value={sync.state.studentRowCount}
              onChange={(event) =>
                sync.setLayout(Number(event.target.value), sync.state.seatsPerRow)
              }
            />
          </label>
          <label>
            Seats per row
            <input
              type="number"
              min={MIN_SEATS_PER_ROW}
              max={MAX_SEATS_PER_ROW}
              value={sync.state.seatsPerRow}
              onChange={(event) =>
                sync.setLayout(sync.state.studentRowCount, Number(event.target.value))
              }
            />
          </label>
          <button type="button" className="ghost-button" onClick={handleReset}>
            Reset seats
          </button>
        </section>

        <div className="workspace">
          <main className="hall">
            <div className="blackboard">Front · 讲台</div>

            <ClassroomRow
              label="AA & PAs"
              hint="Academic advisor and peer advisors"
              seats={Array.from({ length: sync.state.seatsPerRow }, (_, seat) => {
                const occupantId = occupantAt(sync.state, "advisor", 0, seat);
                const occupant = occupantId ? peopleById[occupantId] : undefined;
                return (
                  <Seat
                    key={seatKey("advisor", 0, seat)}
                    id={seatKey("advisor", 0, seat)}
                    occupant={occupant}
                    highlighted={Boolean(occupant && query.trim() && matchesQuery(occupant, query))}
                  />
                );
              })}
            />

            <div className="aisle" aria-label="Empty row">
              <span>Empty row · 过道</span>
            </div>

            {Array.from({ length: sync.state.studentRowCount }, (_, row) => (
              <ClassroomRow
                key={row}
                label={`Row ${row + 1}`}
                hint="Students"
                seats={Array.from({ length: sync.state.seatsPerRow }, (_, seat) => {
                  const occupantId = occupantAt(sync.state, "student", row, seat);
                  const occupant = occupantId ? peopleById[occupantId] : undefined;
                  return (
                    <Seat
                      key={seatKey("student", row, seat)}
                      id={seatKey("student", row, seat)}
                      occupant={occupant}
                      highlighted={Boolean(occupant && query.trim() && matchesQuery(occupant, query))}
                    />
                  );
                })}
              />
            ))}
          </main>

          <NameCardTray
            advisors={advisors}
            peerAdvisors={peerAdvisors}
            students={students}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activePerson ? <NameCard person={activePerson} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function ClassroomRow({
  label,
  hint,
  seats,
}: {
  label: string;
  hint: string;
  seats: ReactNode[];
}) {
  return (
    <section className="class-row">
      <div className="class-row__label">
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <div className="class-row__seats">{seats}</div>
    </section>
  );
}

function StatusPill({
  status,
  connectedCount,
}: {
  status: "connecting" | "live" | "reconnecting" | "offline";
  connectedCount: number;
}) {
  const label =
    status === "live"
      ? "Live"
      : status === "reconnecting"
        ? "Reconnecting"
        : status === "offline"
          ? "Offline"
          : "Connecting";

  return (
    <p className={`status status--${status}`}>
      <span className="status__dot" />
      {label} · {connectedCount} online
    </p>
  );
}
