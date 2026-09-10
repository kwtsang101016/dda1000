import { useMemo, useRef, useState, type ReactNode } from "react";
import rosterData from "./data/roster.json" with { type: "json" };
import { NameCardTray } from "./components/NameCardTray.tsx";
import { ProfileEditor } from "./components/ProfileEditor.tsx";
import { Seat } from "./components/Seat.tsx";
import { mergePerson } from "./lib/people.ts";
import { useClassroomSync } from "./lib/useClassroomSync.ts";
import {
  MAX_SEATS_PER_ROW,
  MAX_STUDENT_ROWS,
  MIN_SEATS_PER_ROW,
  MIN_STUDENT_ROWS,
  occupantAt,
  seatKey,
} from "../shared/seating.ts";
import type { Person, PersonProfile, Roster, SeatRef } from "../shared/types.ts";

const roster = rosterData as Roster;

function matchesQuery(person: Person, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return (
    person.name.toLowerCase().includes(needle) ||
    person.englishName.toLowerCase().includes(needle) ||
    person.studentId.toLowerCase().includes(needle) ||
    person.college.toLowerCase().includes(needle)
  );
}

function byChineseName(a: Person, b: Person): number {
  return a.name.localeCompare(b.name, "zh-CN");
}

export default function App() {
  const sync = useClassroomSync();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const lastTapRef = useRef<{ id: string; at: number } | null>(null);

  const peopleById = useMemo(() => {
    const map: Record<string, ReturnType<typeof mergePerson>> = {};
    for (const person of roster.people) {
      map[person.id] = mergePerson(person, sync.state.profiles[person.id]);
    }
    return map;
  }, [sync.state.profiles]);

  const seatedIds = useMemo(() => new Set(Object.keys(sync.state.placements)), [sync.state.placements]);
  const seatedCount = roster.people.filter((person) => seatedIds.has(person.id)).length;

  const unseated = useMemo(
    () =>
      roster.people
        .filter((person) => !seatedIds.has(person.id) && matchesQuery(person, query))
        .map((person) => peopleById[person.id])
        .sort(byChineseName),
    [peopleById, query, seatedIds],
  );

  const advisors = unseated.filter((person) => person.role === "aa");
  const peerAdvisors = unseated.filter((person) => person.role === "pa");
  const students = unseated.filter((person) => person.role === "student");
  const selectedPerson = selectedId ? peopleById[selectedId] : undefined;
  const editingPerson = editingId ? peopleById[editingId] : undefined;

  const selectPerson = (personId: string) => {
    setSelectedId((current) => (current === personId ? null : personId));
  };

  const placeSelected = (target: SeatRef) => {
    if (!selectedId) {
      return;
    }
    sync.place(selectedId, target);
    setSelectedId(null);
  };

  const handleSeatTap = (target: SeatRef, occupantId?: string) => {
    const now = Date.now();
    if (occupantId) {
      const last = lastTapRef.current;
      if (last && last.id === occupantId && now - last.at < 380) {
        lastTapRef.current = null;
        sync.unseat(occupantId);
        if (selectedId === occupantId) {
          setSelectedId(null);
        }
        return;
      }
      lastTapRef.current = { id: occupantId, at: now };
    } else {
      lastTapRef.current = null;
    }

    if (selectedId) {
      if (occupantId === selectedId) {
        setSelectedId(null);
        return;
      }
      placeSelected(target);
      return;
    }

    if (occupantId) {
      setSelectedId(occupantId);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm("Return every name card to the side tray?");
    if (confirmed) {
      sync.reset();
      setSelectedId(null);
    }
  };

  const handleSaveProfile = (profile: PersonProfile) => {
    if (!editingId) {
      return;
    }
    sync.updateProfile(editingId, profile);
    setEditingId(null);
  };

  const seatCount = sync.state.seatsPerRow;

  return (
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

      {selectedPerson ? (
        <div className="selection-bar">
          <p>
            Selected: <strong>{selectedPerson.name}</strong> — tap an empty seat to sit
            {seatedIds.has(selectedPerson.id) ? ", or another empty seat to move" : ""}.
          </p>
          <div className="selection-bar__actions">
            <button type="button" className="ghost-button" onClick={() => setEditingId(selectedPerson.id)}>
              Edit card
            </button>
            {seatedIds.has(selectedPerson.id) ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  sync.unseat(selectedPerson.id);
                  setSelectedId(null);
                }}
              >
                Stand up
              </button>
            ) : null}
            <button type="button" className="ghost-button" onClick={() => setSelectedId(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="howto">
          Phone-friendly: tap a name card, then tap a seat. Double-tap a seated name to cancel.
          Press and hold a seat to enlarge the name.
        </p>
      )}

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
        <main className="hall" style={{ ["--seats-per-row" as string]: seatCount }}>
          <div className="blackboard">Front · 讲台</div>

          <ClassroomRow
            label="AA & PAs"
            hint="Academic advisor and peer advisors"
            seats={Array.from({ length: seatCount }, (_, seat) => {
              const target: SeatRef = { zone: "advisor", row: 0, seat };
              const occupantId = occupantAt(sync.state, "advisor", 0, seat);
              const occupant = occupantId ? peopleById[occupantId] : undefined;
              return (
                <Seat
                  key={seatKey("advisor", 0, seat)}
                  seatCount={seatCount}
                  occupant={occupant}
                  selected={selectedId === occupantId}
                  targetable={Boolean(selectedId) && !occupant}
                  highlighted={Boolean(occupant && query.trim() && matchesQuery(occupant, query))}
                  onSelect={() => handleSeatTap(target, occupantId)}
                  onDoubleUnseat={() => {
                    if (!occupantId) {
                      return;
                    }
                    sync.unseat(occupantId);
                    if (selectedId === occupantId) {
                      setSelectedId(null);
                    }
                  }}
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
              seats={Array.from({ length: seatCount }, (_, seat) => {
                const target: SeatRef = { zone: "student", row, seat };
                const occupantId = occupantAt(sync.state, "student", row, seat);
                const occupant = occupantId ? peopleById[occupantId] : undefined;
                return (
                  <Seat
                    key={seatKey("student", row, seat)}
                    seatCount={seatCount}
                    occupant={occupant}
                    selected={selectedId === occupantId}
                    targetable={Boolean(selectedId) && !occupant}
                    highlighted={Boolean(occupant && query.trim() && matchesQuery(occupant, query))}
                    onSelect={() => handleSeatTap(target, occupantId)}
                    onDoubleUnseat={() => {
                      if (!occupantId) {
                        return;
                      }
                      sync.unseat(occupantId);
                      if (selectedId === occupantId) {
                        setSelectedId(null);
                      }
                    }}
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
          selectedId={selectedId}
          onQueryChange={setQuery}
          onSelect={selectPerson}
          onEdit={setEditingId}
        />
      </div>

      {editingPerson ? (
        <ProfileEditor
          person={editingPerson}
          onClose={() => setEditingId(null)}
          onSave={handleSaveProfile}
        />
      ) : null}
    </div>
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
