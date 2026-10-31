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

export interface Course {
  code: string;
  title: string;
  units: number;
  /** Majors that list this course somewhere in their scheme. */
  majors: MajorId[];
  roles: RoleTag[];
  streams: StreamTag[];
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
