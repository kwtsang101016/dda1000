import {
  COURSE_MAP,
  coursesForMajor,
  rolesForMajor,
  streamsForMajor,
} from "../data/courses";
import type { Course, MajorId, RoleTag, StreamTag } from "../data/types";

export function getCourse(code: string | null | undefined): Course | undefined {
  if (!code) return undefined;
  return COURSE_MAP.get(code);
}

/**
 * Family key for mutually exclusive variants of the same course code
 * (e.g. STA2001 / STA2001H, MAT2041 / MAT2041A → same family).
 */
export function courseFamilyKey(code: string): string {
  const match = code.trim().toUpperCase().match(/^([A-Z]+\d+)/);
  return match ? match[1] : code.trim().toUpperCase();
}

/** True if `code` is the same offering or a letter-suffix variant already taken. */
export function conflictsWithTaken(code: string, taken: Set<string>): boolean {
  if (taken.has(code)) return true;
  const family = courseFamilyKey(code);
  for (const other of taken) {
    if (other === code) continue;
    if (courseFamilyKey(other) === family) return true;
  }
  return false;
}

export function filterCatalogue(options: {
  major: MajorId;
  roles?: RoleTag[];
  streams?: StreamTag[];
  query?: string;
  /** Codes already used in other slots — matching families are omitted. */
  taken?: Set<string>;
  /** Keep this code visible even if it conflicts (the slot being edited). */
  allowCode?: string | null;
}): Course[] {
  const q = options.query?.trim().toLowerCase() ?? "";
  const taken = options.taken;
  const allow = options.allowCode ?? null;
  return coursesForMajor(options.major)
    .filter((c) => {
      const roles = rolesForMajor(c, options.major);
      const streams = streamsForMajor(c, options.major);
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.some((r) => roles.includes(r))) return false;
      }
      if (options.streams && options.streams.length > 0) {
        if (!options.streams.some((s) => streams.includes(s))) return false;
      }
      if (taken && c.code !== allow && conflictsWithTaken(c.code, taken)) {
        return false;
      }
      if (!q) return true;
      return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q);
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

export { rolesForMajor, streamsForMajor };
