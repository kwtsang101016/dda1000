export type Role = "aa" | "pa" | "student";
export type Zone = "advisor" | "student";

export interface SeatRef {
  zone: Zone;
  row: number;
  seat: number;
}

export interface ClassroomState {
  studentRowCount: number;
  seatsPerRow: number;
  placements: Record<string, SeatRef>;
}

export interface Person {
  id: string;
  studentId: string;
  name: string;
  englishName: string;
  role: Role;
  college: string;
  plan: string;
  leading?: boolean;
}

export interface Roster {
  course: string;
  section: string;
  classroom: string;
  people: Person[];
}

export type ClientEvent =
  | { type: "place"; personId: string; target: SeatRef }
  | { type: "unseat"; personId: string }
  | { type: "setLayout"; studentRowCount: number; seatsPerRow: number }
  | { type: "reset" };

export interface ServerSnapshot {
  state: ClassroomState;
  connectedCount: number;
}
