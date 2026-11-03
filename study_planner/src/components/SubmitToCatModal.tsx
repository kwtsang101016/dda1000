import { useEffect, useMemo, useState } from "react";
import {
  fetchCatRosterCards,
  submitPlanToCat,
  type CatRosterCard,
} from "../lib/catApi";
import type { StoredState } from "../lib/storage";
import "./SubmitToCatModal.css";

interface Props {
  state: StoredState;
  onClose: () => void;
}

export function SubmitToCatModal({ state, onClose }: Props) {
  const [cards, setCards] = useState<CatRosterCard[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [rosterError, setRosterError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [personId, setPersonId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneAt, setDoneAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const people = await fetchCatRosterCards();
        if (!cancelled) {
          setCards(people);
          setRosterError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setRosterError(
            err instanceof Error ? err.message : "Could not load CAT roster.",
          );
        }
      } finally {
        if (!cancelled) setLoadingRoster(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) =>
      `${c.name} ${c.englishName} ${c.id}`.toLowerCase().includes(q),
    );
  }, [cards, query]);

  const selected = cards.find((c) => c.id === personId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!personId) {
      setError("Select your name card.");
      return;
    }
    if (!studentId.trim()) {
      setError("Enter your student ID.");
      return;
    }
    if (!state.major) {
      setError("Choose a major in the planner before submitting.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitPlanToCat({
        personId,
        studentId: studentId.trim(),
        state,
      });
      setDoneAt(result.submittedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="picker submit-cat"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-cat-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker__head">
          <div>
            <h2 id="submit-cat-title">Submit plan to CAT</h2>
            <p>
              Sends your current planner JSON to the Class Attending Table and marks
              your name card. Enter the student ID that matches your card (same as
              seating).
            </p>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </header>

        {doneAt ? (
          <div className="submit-cat__done">
            <p>
              Submitted{selected ? ` for ${selected.name}` : ""}. Your CAT name card
              should show an amber “plan submitted” mark once CAT is open.
            </p>
            <p className="submit-cat__meta">
              {new Date(doneAt).toLocaleString()}
              {state.major ? ` · ${state.major}` : ""}
            </p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="submit-cat__form" onSubmit={(e) => void handleSubmit(e)}>
            {loadingRoster ? <p className="submit-cat__status">Loading roster from CAT…</p> : null}
            {rosterError ? <p className="submit-cat__error">{rosterError}</p> : null}

            <label>
              Find your name
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chinese or English name"
                disabled={loadingRoster || Boolean(rosterError)}
              />
            </label>

            <label>
              Name card
              <select
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
                disabled={loadingRoster || Boolean(rosterError)}
                required
              >
                <option value="">Select…</option>
                {filtered.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.englishName ? ` · ${c.englishName}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Student ID
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Same ID used in CAT"
                autoComplete="off"
                required
              />
            </label>

            {error ? <p className="submit-cat__error">{error}</p> : null}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={busy || loadingRoster || Boolean(rosterError)}
            >
              {busy ? "Submitting…" : "Submit to CAT"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
