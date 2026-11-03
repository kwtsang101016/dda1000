export type Role = "aa" | "pa" | "student" | "guest";
export type Zone = "advisor" | "student";

export interface SeatRef {
  zone: Zone;
  row: number;
  seat: number;
}

export interface PersonProfile {
  college: string;
  country: string;
  hobbies: string;
  /** Compressed data URL, or empty to clear an override. */
  photoDataUrl: string;
}

/** Lightweight badge info synced to every CAT client (no full plan payload). */
export interface StudyPlanMeta {
  submittedAt: string;
  major: string | null;
  feStream: string | null;
}

/** Full submission stored server-side; fetched when viewing a plan. */
export interface StudyPlanRecord extends StudyPlanMeta {
  personId: string;
  /** Planner export bundle (`dda1000-study-planner`). */
  plan: unknown;
}

export interface ClassroomState {
  studentRowCount: number;
  seatsPerRow: number;
  placements: Record<string, SeatRef>;
  profiles: Record<string, PersonProfile>;
  /**
   * Temporary auditor cards for this live session only.
   * Synced over Socket.io, never written to Redis.
   */
  guests: Person[];
  /** Who has submitted a study plan (for name-card badges). */
  studyPlanMeta: Record<string, StudyPlanMeta>;
}

export interface Person {
  id: string;
  /** Never shipped to the browser; verification uses hashed IDs on the server. */
  studentId?: string;
  name: string;
  englishName: string;
  role: Role;
  college: string;
  plan: string;
  country?: string;
  hobbies?: string;
  /** Static default photo path, e.g. /photos/aa-tsang.png */
  photo?: string;
  leading?: boolean;
}

export interface Roster {
  course: string;
  section: string;
  classroom: string;
  people: Person[];
}

export type PollChoice = "A" | "B" | "C" | "D";

export interface LivePoll {
  id: string;
  question: string;
  /** Short labels under A–D; empty string means just the letter. */
  optionLabels: Record<PollChoice, string>;
  /** Collecting votes vs locked (bars stay visible; voting stops). */
  status: "open" | "locked";
  counts: Record<PollChoice, number>;
  totalVotes: number;
}

export interface ServerSnapshot {
  state: ClassroomState;
  connectedCount: number;
  poll: LivePoll | null;
}

export const MAX_PHOTO_DATA_URL_LENGTH = 180_000;
export const MAX_PROFILE_TEXT_LENGTH = 80;
export const MAX_GUEST_NAME_LENGTH = 40;
/** Cap a single study-plan JSON payload (~photos already use 180kb). */
export const MAX_STUDY_PLAN_JSON_LENGTH = 200_000;
