import { useEffect, useMemo, useState } from "react";
import { ROLE_LABELS, STREAM_COLORS, STREAM_LABELS, STREAMS_BY_MAJOR } from "../data/streams";
import type { MajorId, RoleTag, StreamTag } from "../data/types";
import { conflictsWithTaken, filterCatalogue, getCourse } from "../lib/courseUtils";
import type { PlanSlot } from "../lib/planSlots";
import "./CoursePicker.css";

const ROLE_FILTERS: RoleTag[] = ["school-package", "major-required", "major-elective"];

interface Props {
  slot: PlanSlot;
  major: MajorId;
  taken: Set<string>;
  currentCode: string | null;
  onPick: (code: string) => void;
  onClear?: () => void;
  onClose: () => void;
}

export function CoursePicker({
  slot,
  major,
  taken,
  currentCode,
  onPick,
  onClear,
  onClose,
}: Props) {
  const seededOptions = slot.options && slot.options.length > 0;
  const [query, setQuery] = useState("");
  const [roles, setRoles] = useState<RoleTag[]>(
    slot.roleTag ? [slot.roleTag] : slot.kind === "elective" ? ["major-elective"] : [],
  );
  const [streams, setStreams] = useState<StreamTag[]>([]);

  const streamOptions = STREAMS_BY_MAJOR[major];

  const options = useMemo(() => {
    // Seeded "or" group: show those first when no filters/query, but still allow full catalogue.
    const filtered = filterCatalogue({
      major,
      roles: roles.length ? roles : undefined,
      streams: streams.length ? streams : undefined,
      query,
    });

    if (seededOptions && !query && roles.length <= 1 && streams.length === 0) {
      const preferred = (slot.options ?? [])
        .map((code) => getCourse(code))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      const preferredCodes = new Set(preferred.map((c) => c.code));
      const rest = filtered.filter((c) => !preferredCodes.has(c.code));
      return [...preferred, ...rest];
    }
    return filtered;
  }, [major, roles, streams, query, seededOptions, slot.options]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleRole(role: RoleTag) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  function toggleStream(stream: StreamTag) {
    setStreams((prev) =>
      prev.includes(stream) ? prev.filter((s) => s !== stream) : [...prev, stream],
    );
  }

  return (
    <div className="picker-backdrop" role="presentation" onClick={onClose}>
      <div
        className="picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="picker__head">
          <div>
            <h2 id="picker-title">
              {slot.kind === "elective" ? "Choose major elective" : "Choose course"}
            </h2>
            <p>
              {slot.year != null ? `Year ${slot.year} · Term ${slot.term} · ` : ""}
              {slot.role}
              {seededOptions ? ` · ${slot.options!.join(" or ")}` : ""}
            </p>
          </div>
          <div className="picker__head-actions">
            {onClear && currentCode && (
              <button type="button" className="btn btn--ghost" onClick={onClear}>
                Clear
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        <div className="picker__streams" role="group" aria-label="Role tags">
          {ROLE_FILTERS.map((id) => {
            const active = roles.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`picker__stream${active ? " picker__stream--active" : ""}`}
                onClick={() => toggleRole(id)}
              >
                {ROLE_LABELS[id]}
              </button>
            );
          })}
        </div>

        {streamOptions.length > 0 && (
          <div className="picker__streams" role="group" aria-label="Specialization tags">
            {streamOptions.map((id) => {
              const active = streams.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`picker__stream${active ? " picker__stream--active" : ""}`}
                  style={{
                    borderColor: active ? STREAM_COLORS[id] : `${STREAM_COLORS[id]}55`,
                  }}
                  onClick={() => toggleStream(id)}
                >
                  {STREAM_LABELS[id]}
                </button>
              );
            })}
          </div>
        )}

        <input
          className="picker__search"
          type="search"
          placeholder="Search by code or title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <ul className="picker__list">
          {options.length === 0 && (
            <li className="picker__empty">
              No courses match these tags. Clear a tag or try another search.
            </li>
          )}
          {options.map((c) => {
            const blocked =
              conflictsWithTaken(c.code, taken) && c.code !== currentCode;
            return (
              <li key={c.code}>
                <button
                  type="button"
                  className={`picker__item${c.code === currentCode ? " picker__item--current" : ""}`}
                  disabled={blocked}
                  onClick={() => onPick(c.code)}
                >
                  <span className="picker__code">{c.code}</span>
                  <span className="picker__meta">
                    <span className="picker__title">{c.title}</span>
                    <span className="picker__sub">
                      {c.units}u
                      {c.roles.length
                        ? ` · ${c.roles.map((r) => ROLE_LABELS[r]).join(", ")}`
                        : ""}
                      {c.streams.length
                        ? ` · ${c.streams.map((s) => STREAM_LABELS[s]).join(", ")}`
                        : ""}
                      {blocked ? " · already taken" : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
