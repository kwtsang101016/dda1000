import {
  FE_STREAM_LABELS,
  GRADUATION_TOTAL,
  MAJORS,
  UNIVERSITY_CORE_UNITS,
  freeElectiveUnits,
} from "../data/majors";
import { STREAM_LABELS } from "../data/streams";
import type { FeStreamId, MajorId, StreamTag } from "../data/types";
import { getCourse } from "./courseUtils";
import {
  analyzeClaimedStream,
  analyzeExtraMajorChecks,
  collectedMajorCodes,
} from "./streamCheck";
import {
  buildTermGroups,
  termLabelFor,
  type ManualAssignments,
  type PlanAssignments,
  type PlanSlot,
  type SlotPlacements,
} from "./planSlots";

export interface PdfExportInput {
  major: MajorId;
  feStream: FeStreamId | null;
  majorSlots: PlanSlot[];
  ucSlots: PlanSlot[];
  freeSlots: PlanSlot[];
  assignments: PlanAssignments;
  manual: ManualAssignments;
  placements: SlotPlacements;
  summerYears: number[];
  claimedStream: StreamTag | null;
}

const MARGIN = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

export async function downloadPlanPdf(input: PdfExportInput): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const {
    major,
    feStream,
    majorSlots,
    ucSlots,
    freeSlots,
    assignments,
    manual,
    placements,
    summerYears,
    claimedStream,
  } = input;

  const info = MAJORS[major];
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const ensureSpace = (need: number) => {
    if (y + need > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const line = (text: string, opts?: { bold?: boolean; size?: number; color?: [number, number, number] }) => {
    const size = opts?.size ?? 10;
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(size);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(20, 32, 31);
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    ensureSpace(lines.length * (size * 0.4) + 2);
    for (const row of lines) {
      doc.text(row, MARGIN, y);
      y += size * 0.4;
    }
    y += 1.5;
  };

  const section = (title: string) => {
    ensureSpace(12);
    y += 2;
    doc.setDrawColor(10, 77, 74);
    doc.setLineWidth(0.4);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 6;
    line(title, { bold: true, size: 12, color: [10, 77, 74] });
  };

  // Header
  line("SDS Study Planner · DDA1000", { bold: true, size: 16, color: [10, 77, 74] });
  line("Draft study plan for advisor review", { size: 10 });
  line(`Exported: ${new Date().toLocaleString()}`, { size: 9, color: [74, 92, 90] });
  y += 2;

  section("Programme");
  line(`Major: ${info.label} (${info.shortLabel})`);
  line(`Scheme last update: ${info.lastUpdate}`);
  if (major === "FE") {
    line(
      `FE specialization: ${feStream ? FE_STREAM_LABELS[feStream] : "Not selected"}`,
    );
  }
  line(
    `Claimed stream: ${
      claimedStream ? STREAM_LABELS[claimedStream] : "None (not declaring a stream)"
    }`,
  );
  line(
    `Targets: University Core ${UNIVERSITY_CORE_UNITS}u · Major ${info.majorUnits}u · Free electives ${freeElectiveUnits(major)}u · Total ${GRADUATION_TOTAL}u`,
  );

  const taken = collectedMajorCodes(assignments);
  const claim = analyzeClaimedStream(major, claimedStream, taken);
  const extras = analyzeExtraMajorChecks(major, taken);

  section("Requirements snapshot");
  let majorUnits = 0;
  for (const slot of majorSlots) {
    const code = assignments[slot.id];
    if (!code) continue;
    majorUnits += getCourse(code)?.units ?? slot.units;
  }
  const ucUnits = Object.entries(manual)
    .filter(([id]) => id.startsWith("uc-"))
    .reduce((s, [, c]) => s + (c?.units ?? 0), 0);
  const freeUnits = Object.entries(manual)
    .filter(([id]) => id.startsWith("free-"))
    .reduce((s, [, c]) => s + (c?.units ?? 0), 0);
  line(`Planned units: Major ${majorUnits}u · UC ${ucUnits}u · Free ${freeUnits}u · Total ${majorUnits + ucUnits + freeUnits}u`);
  if (claim) {
    line(
      `Stream claim (${STREAM_LABELS[claim.stream]}): ${claim.count}/${claim.minCourses} courses${
        claim.satisfied ? " — OK to declare" : " — not yet enough"
      }`,
    );
    if (claim.matchedCodes.length) {
      line(`  Counting: ${claim.matchedCodes.join(", ")}`, { size: 9 });
    }
  }
  if (extras.staDepth) {
    line(
      `STA depth: ${extras.staDepth.count}/${extras.staDepth.minCourses} in ${STREAM_LABELS[extras.staDepth.stream]}${
        extras.staDepth.satisfied ? " — met" : " — short"
      }`,
    );
  }
  if (extras.cseGroupA) {
    line(
      `CSE elective group (a): ${extras.cseGroupA.units}/${extras.cseGroupA.min}u${
        extras.cseGroupA.satisfied ? " — met" : " — short"
      }`,
    );
  }

  section("Course plan by term");
  const groups = buildTermGroups(
    majorSlots,
    [...ucSlots, ...freeSlots],
    placements,
    summerYears,
  );

  for (const group of groups) {
    const heading =
      group.term === "summer"
        ? `Year ${group.year} · Summer`
        : `Year ${group.year} · Term ${group.term} (${termLabelFor(group.term)})`;
    ensureSpace(10);
    line(heading, { bold: true, size: 11 });

    const rows: string[] = [];
    for (const slot of group.majorSlots) {
      const code = assignments[slot.id];
      if (!code) {
        rows.push(`• [empty] ${slot.role}`);
        continue;
      }
      const course = getCourse(code);
      rows.push(
        `• ${code} — ${course?.title ?? "Unknown"} (${course?.units ?? slot.units}u) · ${slot.role}`,
      );
    }
    for (const slot of group.manualSlots) {
      const course = manual[slot.id];
      if (!course) {
        rows.push(
          `• [empty] ${
            slot.kind === "uc"
              ? `UC · ${slot.category ?? "University Core"}`
              : "Free elective"
          }`,
        );
        continue;
      }
      const tag =
        slot.kind === "uc"
          ? `UC · ${slot.category ?? "University Core"}`
          : "Free elective";
      rows.push(
        `• ${course.code} — ${course.title} (${course.units}u) · ${tag}`,
      );
    }
    if (rows.length === 0) {
      line("  (no courses)", { size: 9, color: [74, 92, 90] });
    } else {
      for (const row of rows) line(row, { size: 9 });
    }
    y += 1;
  }

  section("Advisor comments");
  line(
    "Space for comments (student: send this PDF to your instructor; instructor may annotate here or reply by email).",
    { size: 9, color: [74, 92, 90] },
  );
  ensureSpace(40);
  doc.setDrawColor(180, 180, 180);
  for (let i = 0; i < 6; i++) {
    y += 8;
    ensureSpace(10);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  }
  y += 6;

  section("Disclaimer");
  line(
    "Planning aid for DDA1000 only — not an official registration record. Verify with your academic advisor and the Registry before course registration.",
    { size: 8, color: [74, 92, 90] },
  );
  line(`Source: https://kwtsang101016.github.io/dda1000/study_planner/`, {
    size: 8,
    color: [74, 92, 90],
  });

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`dda1000-plan-${info.shortLabel}-${stamp}.pdf`);
}
