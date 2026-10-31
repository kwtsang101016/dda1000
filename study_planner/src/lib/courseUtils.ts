import { COURSE_MAP, coursesForMajor } from "../data/courses";
import type { Course, MajorId, RoleTag, StreamTag } from "../data/types";

export function getCourse(code: string | null | undefined): Course | undefined {
  if (!code) return undefined;
  return COURSE_MAP.get(code);
}

export function conflictsWithTaken(code: string, taken: Set<string>): boolean {
  if (taken.has(code)) return true;
  // Honour pairs: treat H and non-H as alternatives, not both taken.
  if (code.endsWith("H") && taken.has(code.slice(0, -1))) return true;
  if (!code.endsWith("H") && taken.has(`${code}H`)) return true;
  return false;
}

export function filterCatalogue(options: {
  major: MajorId;
  roles?: RoleTag[];
  streams?: StreamTag[];
  query?: string;
}): Course[] {
  const q = options.query?.trim().toLowerCase() ?? "";
  return coursesForMajor(options.major)
    .filter((c) => {
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.some((r) => c.roles.includes(r))) return false;
      }
      if (options.streams && options.streams.length > 0) {
        if (!options.streams.some((s) => c.streams.includes(s))) return false;
      }
      if (!q) return true;
      return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}
