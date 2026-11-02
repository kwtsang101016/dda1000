import { FE_STREAM_LABELS, GRADUATION_TOTAL, MAJORS, UNIVERSITY_CORE_UNITS, freeElectiveUnits } from "../data/majors";
import { SCHEME_NOTES } from "../data/schemeNotes";
import { claimableStreams } from "../data/streamRequirements";
import { ROLE_LABELS, STREAM_COLORS, STREAM_LABELS, STREAMS_BY_MAJOR } from "../data/streams";
import { UC_BREAKDOWN_LABEL, UNIVERSITY_CORE_NOTES } from "../data/universityCore";
import type { FeStreamId, MajorId, RoleTag, StreamTag } from "../data/types";
import { getCourse } from "../lib/courseUtils";
import {
  analyzeClaimedStream,
  analyzeExtraMajorChecks,
  collectedMajorCodes,
} from "../lib/streamCheck";
import type { ManualAssignments, PlanAssignments, PlanSlot } from "../lib/planSlots";
import "./RequirementsSummary.css";

interface Props {
  major: MajorId;
  feStream: FeStreamId | null;
  majorSlots: PlanSlot[];
  assignments: PlanAssignments;
  manual: ManualAssignments;
  remainingUcLabels?: string[];
  remainingFreeSlots?: number;
  claimedStream: StreamTag | null;
  onClaimedStreamChange: (stream: StreamTag | null) => void;
}

interface Bucket {
  filled: number;
  target: number;
  filledSlots: number;
  slots: number;
}

function bucketUnits(
  slots: PlanSlot[],
  assignments: PlanAssignments,
  role: RoleTag,
): Bucket {
  const relevant = slots.filter((s) => s.roleTag === role);
  let filled = 0;
  let filledSlots = 0;
  let target = 0;
  for (const slot of relevant) {
    target += slot.units;
    const code = assignments[slot.id];
    if (!code) continue;
    filledSlots += 1;
    filled += getCourse(code)?.units ?? slot.units;
  }
  return { filled, target, filledSlots, slots: relevant.length };
}

function SatisfiedMark({ ok }: { ok: boolean }) {
  if (!ok) return null;
  return (
    <span className="req-check" title="Requirement met" aria-label="Requirement met">
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <circle cx="10" cy="10" r="10" fill="currentColor" />
        <path
          d="M5.8 10.2 8.6 13l5.6-6.2"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function RequirementsSummary({
  major,
  feStream,
  majorSlots,
  assignments,
  manual,
  remainingUcLabels = [],
  remainingFreeSlots = 0,
  claimedStream,
  onClaimedStreamChange,
}: Props) {
  const info = MAJORS[major];
  const freeTarget = freeElectiveUnits(major);
  const taken = collectedMajorCodes(assignments);

  const school = bucketUnits(majorSlots, assignments, "school-package");
  const required = bucketUnits(majorSlots, assignments, "major-required");
  const elective = bucketUnits(majorSlots, assignments, "major-elective");
  const majorFilled = school.filled + required.filled + elective.filled;

  const ucFilled = Object.entries(manual)
    .filter(([id]) => id.startsWith("uc-"))
    .reduce((sum, [, c]) => sum + (c?.units ?? 0), 0);
  const freeFilled = Object.entries(manual)
    .filter(([id]) => id.startsWith("free-"))
    .reduce((sum, [, c]) => sum + (c?.units ?? 0), 0);
  const totalFilled = majorFilled + ucFilled + freeFilled;

  const claimOptions = claimableStreams(major);
  const claimProgress = analyzeClaimedStream(major, claimedStream, taken);
  const extras = analyzeExtraMajorChecks(major, taken);

  const schoolOk = school.slots > 0 && school.filledSlots === school.slots;
  const requiredOk = required.slots > 0 && required.filledSlots === required.slots;
  const electiveOk = elective.slots > 0 && elective.filledSlots === elective.slots;
  const ucOk = ucFilled >= UNIVERSITY_CORE_UNITS && remainingUcLabels.length === 0;
  const freeOk = freeFilled >= freeTarget && remainingFreeSlots === 0;
  const majorOk = majorFilled >= info.majorUnits;
  const totalOk = totalFilled >= GRADUATION_TOTAL;

  const bars = [
    {
      label: "University Core",
      filled: ucFilled,
      target: UNIVERSITY_CORE_UNITS,
      detail:
        remainingUcLabels.length > 0
          ? `Still to place on a term: ${remainingUcLabels.join(", ")}`
          : `${UC_BREAKDOWN_LABEL} · all on timeline`,
      ok: ucOk,
    },
    {
      label: ROLE_LABELS["school-package"],
      filled: school.filled,
      target: school.target,
      detail: `${school.filledSlots} / ${school.slots} slots filled in recommended pattern`,
      ok: schoolOk,
    },
    {
      label: ROLE_LABELS["major-required"],
      filled: required.filled,
      target: required.target,
      detail: `${required.filledSlots} / ${required.slots} slots filled in recommended pattern`,
      ok: requiredOk,
    },
    {
      label: ROLE_LABELS["major-elective"],
      filled: elective.filled,
      target: elective.target,
      detail: `${elective.filledSlots} / ${elective.slots} elective slots filled`,
      ok: electiveOk,
    },
    {
      label: "Major total",
      filled: majorFilled,
      target: info.majorUnits,
      detail: "School package + major required + major electives",
      ok: majorOk,
    },
    {
      label: "Free Electives",
      filled: freeFilled,
      target: freeTarget,
      detail:
        remainingFreeSlots > 0
          ? `${GRADUATION_TOTAL} − ${UNIVERSITY_CORE_UNITS} UC − ${info.majorUnits} major · ${remainingFreeSlots} slot(s) not yet on a term`
          : `${GRADUATION_TOTAL} − ${UNIVERSITY_CORE_UNITS} UC − ${info.majorUnits} major`,
      ok: freeOk,
    },
  ];

  return (
    <section className="panel" id="requirements">
      <div className="panel__header">
        <h2>Requirements summary</h2>
        <p>
          Running totals toward <strong>{GRADUATION_TOTAL}</strong> units ·{" "}
          {info.label}
          {major === "FE" && feStream ? ` · ${FE_STREAM_LABELS[feStream]}` : ""} ·
          scheme {info.lastUpdate}.
        </p>
      </div>
      <div className={`req-total${totalOk ? " req-total--ok" : ""}`}>
        <SatisfiedMark ok={totalOk} />
        <span className="req-total__number">{totalFilled}</span>
        <span className="req-total__label">/ {GRADUATION_TOTAL} units planned</span>
      </div>
      <div className="req-bars">
        {bars.map((item) => {
          const pct =
            item.target > 0 ? Math.min(100, (item.filled / item.target) * 100) : 0;
          return (
            <div
              key={item.label}
              className={`req-bar${item.ok ? " req-bar--ok" : ""}`}
            >
              <div className="req-bar__head">
                <span className="req-bar__label">
                  <SatisfiedMark ok={item.ok} />
                  {item.label}
                </span>
                <strong>
                  {item.filled} / {item.target} units
                </strong>
              </div>
              <div className="req-bar__track">
                <div className="req-bar__fill" style={{ width: `${pct}%` }} />
              </div>
              <p className="req-bar__detail">{item.detail}</p>
            </div>
          );
        })}
      </div>

      {claimOptions.length > 0 && (
        <div className="stream-claim">
          <h3>Stream declaration (optional)</h3>
          <p>
            Declare at most one stream at your expected graduation term, or none. Claiming a
            stream requires at least <strong>4</strong> courses from that stream’s list.
          </p>
          <div className="stream-claim__row" role="group" aria-label="Claimed stream">
            <button
              type="button"
              className={`stream-claim__btn${claimedStream == null ? " stream-claim__btn--active" : ""}`}
              onClick={() => onClaimedStreamChange(null)}
            >
              No stream
            </button>
            {claimOptions.map((id) => (
              <button
                key={id}
                type="button"
                className={`stream-claim__btn${claimedStream === id ? " stream-claim__btn--active" : ""}`}
                style={{
                  borderColor:
                    claimedStream === id ? STREAM_COLORS[id] : `${STREAM_COLORS[id]}66`,
                }}
                onClick={() => onClaimedStreamChange(id)}
              >
                {STREAM_LABELS[id]}
              </button>
            ))}
          </div>
          {claimProgress && (
            <div
              className={`stream-claim__status${
                claimProgress.satisfied
                  ? " stream-claim__status--ok"
                  : " stream-claim__status--short"
              }`}
            >
              <strong className="stream-claim__status-title">
                <SatisfiedMark ok={claimProgress.satisfied} />
                {STREAM_LABELS[claimProgress.stream]}: {claimProgress.count} /{" "}
                {claimProgress.minCourses} stream courses on your plan
                {claimProgress.satisfied ? " — requirement met" : " — not yet enough to declare"}
              </strong>
              <p>
                {claimProgress.matchedCodes.length > 0
                  ? `Counting: ${claimProgress.matchedCodes.join(", ")}`
                  : "No courses from this stream’s list are on your plan yet."}
              </p>
            </div>
          )}
          {claimedStream == null && (
            <p className="stream-claim__hint">
              Not declaring a stream: no extra stream course quota applies
              {major === "STA" ? " (depth requirement below still applies)" : ""}.
            </p>
          )}
        </div>
      )}

      {major === "FE" && (
        <div className="stream-claim">
          <h3>FE specialization (required)</h3>
          <p>
            You already chose{" "}
            <strong>
              {feStream ? FE_STREAM_LABELS[feStream] : "—"}
            </strong>
            . FE students must follow that stream’s required / elective pattern (seeded above).
          </p>
        </div>
      )}

      {extras.staDepth && (
        <div
          className={`stream-claim__status${
            extras.staDepth.satisfied
              ? " stream-claim__status--ok"
              : " stream-claim__status--short"
          }`}
        >
          <strong className="stream-claim__status-title">
            <SatisfiedMark ok={extras.staDepth.satisfied} />
            STA depth requirement: {extras.staDepth.count} / {extras.staDepth.minCourses}{" "}
            courses in best stream ({STREAM_LABELS[extras.staDepth.stream]})
            {extras.staDepth.satisfied ? " — met" : " — need 3 from any one stream"}
          </strong>
          <p>
            {extras.staDepth.matchedCodes.length > 0
              ? `Currently strongest in ${STREAM_LABELS[extras.staDepth.stream]}: ${extras.staDepth.matchedCodes.join(", ")}`
              : "Pick electives within one stream list to build depth."}
          </p>
        </div>
      )}

      {extras.cseGroupA && (
        <div
          className={`stream-claim__status${
            extras.cseGroupA.satisfied
              ? " stream-claim__status--ok"
              : " stream-claim__status--short"
          }`}
        >
          <strong className="stream-claim__status-title">
            <SatisfiedMark ok={extras.cseGroupA.satisfied} />
            CSE elective group (a): {extras.cseGroupA.units} / {extras.cseGroupA.min}{" "}
            units (of {extras.cseGroupA.totalTarget} elective units total)
            {extras.cseGroupA.satisfied ? " — met" : " — need ≥18u from group (a)"}
          </strong>
          <p>
            Remaining elective units may come from group (a) or (b). See scheme notes below.
          </p>
        </div>
      )}

      <div className="scheme-notes">
        <h3>University Core &amp; GE notes</h3>
        <ul>
          {UNIVERSITY_CORE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="scheme-notes">
        <h3>Scheme notes ({info.shortLabel})</h3>
        <ul>
          {SCHEME_NOTES[major].map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>

      <div className="stream-legend">
        <h3>Stream tags in the course picker</h3>
        <ul>
          {STREAMS_BY_MAJOR[major].map((id) => (
            <li key={id}>
              <span className="stream-dot" style={{ background: STREAM_COLORS[id] }} />
              {STREAM_LABELS[id]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
