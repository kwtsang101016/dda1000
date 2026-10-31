import {
  FE_STREAM_LABELS,
  GRADUATION_TOTAL,
  MAJORS,
  UNIVERSITY_CORE_UNITS,
  freeElectiveUnits,
} from "../data/majors";
import { ROLE_LABELS, STREAM_COLORS, STREAM_LABELS, STREAMS_BY_MAJOR } from "../data/streams";
import type { FeStreamId, MajorId, RoleTag } from "../data/types";
import { getCourse } from "../lib/courseUtils";
import type { ManualAssignments, PlanAssignments, PlanSlot } from "../lib/planSlots";
import "./RequirementsSummary.css";

interface Props {
  major: MajorId;
  feStream: FeStreamId | null;
  majorSlots: PlanSlot[];
  assignments: PlanAssignments;
  manual: ManualAssignments;
}

function bucketUnits(
  slots: PlanSlot[],
  assignments: PlanAssignments,
  role: RoleTag,
): { filled: number; slots: number } {
  const relevant = slots.filter((s) => s.roleTag === role);
  let filled = 0;
  for (const slot of relevant) {
    const code = assignments[slot.id];
    if (!code) continue;
    filled += getCourse(code)?.units ?? slot.units;
  }
  return { filled, slots: relevant.length };
}

export function RequirementsSummary({
  major,
  feStream,
  majorSlots,
  assignments,
  manual,
}: Props) {
  const info = MAJORS[major];
  const freeTarget = freeElectiveUnits(major);

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

  const bars = [
    {
      label: "University Core",
      filled: ucFilled,
      target: UNIVERSITY_CORE_UNITS,
      detail: "Chinese 3 + English 12 + Digital & AI Literacy 1 + GE 18 + PE 2",
    },
    {
      label: ROLE_LABELS["school-package"],
      filled: school.filled,
      target: null as number | null,
      detail: `${school.slots} slots in recommended pattern`,
    },
    {
      label: ROLE_LABELS["major-required"],
      filled: required.filled,
      target: null,
      detail: `${required.slots} slots in recommended pattern`,
    },
    {
      label: ROLE_LABELS["major-elective"],
      filled: elective.filled,
      target: null,
      detail: `${elective.slots} elective slots in recommended pattern`,
    },
    {
      label: "Major total",
      filled: majorFilled,
      target: info.majorUnits,
      detail: "School package + major required + major electives",
    },
    {
      label: "Free Electives",
      filled: freeFilled,
      target: freeTarget,
      detail: `${GRADUATION_TOTAL} − ${UNIVERSITY_CORE_UNITS} UC − ${info.majorUnits} major`,
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
      <div className="req-total">
        <span className="req-total__number">{totalFilled}</span>
        <span className="req-total__label">/ {GRADUATION_TOTAL} units planned</span>
      </div>
      <div className="req-bars">
        {bars.map((item) => {
          const pct = item.target
            ? Math.min(100, (item.filled / item.target) * 100)
            : Math.min(100, item.filled > 0 ? 40 + item.filled : 0);
          return (
            <div key={item.label} className="req-bar">
              <div className="req-bar__head">
                <span>{item.label}</span>
                <strong>
                  {item.filled}
                  {item.target != null ? ` / ${item.target}` : ""} units
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
      <div className="stream-legend">
        <h3>Specialization stream tags (filters only)</h3>
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
