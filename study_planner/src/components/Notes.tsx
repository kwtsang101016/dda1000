import { PLANNER_NOTES } from "../data/notes";
import "./Notes.css";

export function Notes() {
  return (
    <section className="panel" id="notes">
      <div className="panel__header">
        <h2>Notes</h2>
        <p>Planning aid for DDA1000 — verify with your advisor and the Registry.</p>
      </div>
      <div className="notes-grid">
        {PLANNER_NOTES.map((body, i) => (
          <article key={i} className="note-card">
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
