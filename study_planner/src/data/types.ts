export type MajorId = "CSE" | "DSBDT" | "STA" | "FE";

export type FeStreamId = "qf" | "fintech";

export type RoleTag = "school-package" | "major-required" | "major-elective";

export type StreamTag =
  | "cse-ai"
  | "ds-method"
  | "ds-finance"
  | "ds-ops"
  | "ds-life"
  | "ds-computing"
  | "sta-math"
  | "sta-method"
  | "sta-biostat"
  | "sta-finance"
  | "sta-computing"
  | "fe-qf"
  | "fe-fintech";

/** Per-major membership: school package / required / elective (+ stream tags). */
export interface CourseOffering {
  roles: RoleTag[];
  streams?: StreamTag[];
}

export interface Course {
  code: string;
  title: string;
  units: number;
  /** Role and stream tags differ by major (e.g. FIN2010 is FE school package, STA elective). */
  offerings: Partial<Record<MajorId, CourseOffering>>;
  term2Only?: boolean;
  statusNote?: string;
}

export interface PatternRow {
  year: number;
  term: 1 | 2;
  label: string;
  /** Role label shown on the slot, e.g. School package. */
  role: RoleTag | "major-elective";
  /** Course groups: each inner array is an "or" choice; empty means elective blank. */
  groups: string[][];
  electiveSlots?: number;
}

export interface ManualCourse {
  code: string;
  title: string;
  units: number;
}

export type CatalogAssignment = string | null;

export interface ManualAssignment {
  kind: "manual";
  course: ManualCourse | null;
}
