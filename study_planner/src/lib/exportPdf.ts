import {
  FE_STREAM_LABELS,
  MAJORS,
} from "../data/majors";
import { STREAM_LABELS } from "../data/streams";
import type { FeStreamId, MajorId, StreamTag } from "../data/types";
import { getCourse } from "./courseUtils";
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

const MARGIN = 14;
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

  const line = (
    text: string,
    opts?: { bold?: boolean; size?: number; color?: [number, number, number] },
  ) => {
    const size = opts?.size ?? 10;
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(size);
    if (opts?.color) doc.setTextColor(...opts.color);
    else doc.setTextColor(20, 32, 31);
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    ensureSpace(lines.length * (size * 0.38) + 1.2);
    for (const row of lines) {
      doc.text(row, MARGIN, y);
      y += size * 0.38;
    }
    y += 1.2;
  };

  // Compact header for a pin-up printout
  line("My study plan · SDS / DDA1000", {
    bold: true,
    size: 14,
    color: [10, 77, 74],
  });
  const subtitle = [
    info.label,
    major === "FE" && feStream ? FE_STREAM_LABELS[feStream] : null,
    claimedStream ? STREAM_LABELS[claimedStream] : null,
  ]
    .filter(Boolean)
    .join(" · ");
  line(subtitle, { size: 10, color: [74, 92, 90] });
  y += 2;

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
    line(heading, { bold: true, size: 11, color: [10, 77, 74] });

    const rows: string[] = [];
    for (const slot of group.majorSlots) {
      const code = assignments[slot.id];
      if (!code) {
        rows.push(`• [ ] ${slot.role}`);
        continue;
      }
      const course = getCourse(code);
      rows.push(
        `• ${code}  ${course?.title ?? "Unknown"}  (${course?.units ?? slot.units}u)`,
      );
    }
    for (const slot of group.manualSlots) {
      const course = manual[slot.id];
      if (!course) {
        rows.push(
          `• [ ] ${
            slot.kind === "uc"
              ? `UC · ${slot.category ?? "University Core"}`
              : "Free elective"
          }`,
        );
        continue;
      }
      rows.push(`• ${course.code}  ${course.title}  (${course.units}u)`);
    }
    if (rows.length === 0) {
      line("  —", { size: 9, color: [74, 92, 90] });
    } else {
      for (const row of rows) line(row, { size: 9.5 });
    }
    y += 1.5;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`dda1000-plan-${info.shortLabel}-${stamp}.pdf`);
}
