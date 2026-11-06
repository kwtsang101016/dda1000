import type { Roster } from "../../shared/types.ts";

interface ExportedStudyPlans {
  ok: boolean;
  message?: string;
  course?: string;
  section?: string;
  exportedAt?: string;
  count?: number;
  plans?: unknown[];
}

function stampForFilename(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

/** Downloads every submitted study plan. The instructor PIN is not written into the file. */
export async function downloadStudyPlans(pin: string, roster: Roster): Promise<number> {
  const response = await fetch("/api/study-plans/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instructorPin: pin }),
  });
  let payload: ExportedStudyPlans;
  try {
    payload = (await response.json()) as ExportedStudyPlans;
  } catch {
    throw new Error("The server did not return the study plans.");
  }
  if (!response.ok || !payload.ok || !Array.isArray(payload.plans)) {
    throw new Error(payload.message ?? "Could not save the study plans.");
  }

  const file = {
    course: payload.course ?? roster.course,
    section: payload.section ?? roster.section,
    exportedAt: payload.exportedAt ?? new Date().toISOString(),
    count: payload.plans.length,
    plans: payload.plans,
  };
  const blob = new Blob([`${JSON.stringify(file, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${roster.course}-${roster.section}-study-plans-${stampForFilename(new Date())}.json`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return payload.plans.length;
}
