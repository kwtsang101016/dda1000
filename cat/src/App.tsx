import { useMemo, useRef, useState, type ReactNode } from "react";
import rosterData from "./data/roster.json" with { type: "json" };
import { AuthModal } from "./components/AuthModal.tsx";
import { NameCardTray } from "./components/NameCardTray.tsx";
import { ProfileEditor } from "./components/ProfileEditor.tsx";
import { Seat } from "./components/Seat.tsx";
import { rememberInstructorSecret, rememberPersonSecret } from "./lib/authSession.ts";
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

type PendingAction =
  | { type: "place"; personId: string; target: SeatRef }
  | { type: "unseat"; personId: string }
  | { type: "edit"; personId: string }
  | { type: "reset" }
  | { type: "setLayout"; studentRowCount: number; seatsPerRow: number };

function matchesQuery(person: Person, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return (
    person.name.toLowerCase().includes(needle) ||
    person.englishName.toLowerCase().includes(needle) ||
    person.college.toLowerCase().includes(needle)
  );
}

function byChineseName(a: Person, b: Person): number {
  return a.name.localeCompare(b.name, "zh-CN");
}

function requiresInstructorOnly(personId: string): boolean {
  const person = roster.people.find((entry) => entry.id === personId);
  return person?.role === "aa";
}

export default function App() {
  const sync = useClassroomSync();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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

  const runAction = (action: PendingAction) => {
    switch (action.type) {
      case "place":
        sync.place(action.personId, action.target);
        setSelectedId(null);
        break;
      case "unseat":
        sync.unseat(action.personId);
        if (selectedId === action.personId) {
          setSelectedId(null);
        }
        break;
      case "edit":
        setEditingId(action.personId);
        break;
      case "reset":
        sync.reset();
        setSelectedId(null);
        break;
      case "setLayout":
        sync.setLayout(action.studentRowCount, action.seatsPerRow);
        break;
    }
  };

  const ensureAndRun = (action: PendingAction) => {
    if (action.type === "reset" || action.type === "setLayout") {
      if (sync.isInstructor) {
        runAction(action);
        return;
      }
      setAuthError(null);
      setPending(action);
      return;
    }

    if (sync.canControl(action.personId)) {
      runAction(action);
      return;
    }

    setAuthError(null);
    setPending(action);
  };

  const selectPerson = (personId: string) => {
    setSelectedId((current) => (current === personId ? null : personId));
  };

  const handleSeatTap = (target: SeatRef, occupantId?: string) => {
    const now = Date.now();
    if (occupantId) {
      const last = lastTapRef.current;
      if (last && last.id === occupantId && now - last.at < 380) {
        lastTapRef.current = null;
        ensureAndRun({ type: "unseat", personId: occupantId });
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
      ensureAndRun({ type: "place", personId: selectedId, target });
      return;
    }

    if (occupantId) {
      setSelectedId(occupantId);
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm("Return every name card to the side tray?");
    if (confirmed) {
      ensureAndRun({ type: "reset" });
    }
  };

  const handleSaveProfile = (profile: PersonProfile) => {
    if (!editingId) {
      return;
    }
    sync.updateProfile(editingId, profile);
    setEditingId(null);
  };

  const pendingPersonId =
    pending && pending.type !== "reset" && pending.type !== "setLayout" ? pending.personId : null;
  const pendingPersonName =
    pending?.type === "reset" || pending?.type === "setLayout"
      ? "Instructor controls"
      : pendingPersonId
        ? peopleById[pendingPersonId]?.name || "Name card"
        : "";

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
            {sync.isInstructor ? " · instructor" : ""}
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
            You will be asked for your student ID.
          </p>
          <div className="selection-bar__actions">
            <button
              type="button"
              className="ghost-button"
              onClick={() => ensureAndRun({ type: "edit", personId: selectedPerson.id })}
            >
              Edit card
            </button>
            {seatedIds.has(selectedPerson.id) ? (
              <button
                type="button"
                className="ghost-button"
                onClick={() => ensureAndRun({ type: "unseat", personId: selectedPerson.id })}
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
          Tap a name card, then a seat. Student ID is required to sit, move, stand up, or edit —
          IDs are not shown on the page. Press and hold a seat for details. Double-tap to stand up.
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
              ensureAndRun({
                type: "setLayout",
                studentRowCount: Number(event.target.value),
                seatsPerRow: sync.state.seatsPerRow,
              })
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
              ensureAndRun({
                type: "setLayout",
                studentRowCount: sync.state.studentRowCount,
                seatsPerRow: Number(event.target.value),
              })
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
                    ensureAndRun({ type: "unseat", personId: occupantId });
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
                      ensureAndRun({ type: "unseat", personId: occupantId });
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
          onEdit={(personId) => ensureAndRun({ type: "edit", personId })}
        />
      </div>

      {editingPerson ? (
        <ProfileEditor
          person={editingPerson}
          onClose={() => setEditingId(null)}
          onSave={handleSaveProfile}
        />
      ) : null}

      {pending ? (
        <AuthModal
          personName={pendingPersonName}
          requiresInstructorOnly={
            pending.type === "reset" ||
            pending.type === "setLayout" ||
            (pendingPersonId ? requiresInstructorOnly(pendingPersonId) : false)
          }
          busy={authBusy}
          error={authError}
          onCancel={() => {
            setPending(null);
            setAuthError(null);
          }}
          onSubmit={(secret, asInstructor) => {
            void (async () => {
              setAuthBusy(true);
              setAuthError(null);
              try {
                await sync.authorize({
                  personId: pendingPersonId ?? undefined,
                  secret,
                  asInstructor,
                });
                if (asInstructor) {
                  rememberInstructorSecret(secret);
                } else if (pendingPersonId) {
                  rememberPersonSecret(pendingPersonId, secret);
                }
                const action = pending;
                setPending(null);
                runAction(action);
              } catch (error) {
                setAuthError(error instanceof Error ? error.message : "Verification failed.");
              } finally {
                setAuthBusy(false);
              }
            })();
          }}
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
