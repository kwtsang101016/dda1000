import type { ClassroomState, PersonProfile, SeatRef, Zone } from "./types.ts";
import { MAX_PHOTO_DATA_URL_LENGTH, MAX_PROFILE_TEXT_LENGTH } from "./types.ts";

export const MIN_STUDENT_ROWS = 1;
export const MAX_STUDENT_ROWS = 12;
export const MIN_SEATS_PER_ROW = 4;
export const MAX_SEATS_PER_ROW = 16;

export const EMPTY_PROFILE: PersonProfile = {
  college: "",
  country: "",
  hobbies: "",
  photoDataUrl: "",
};

export const DEFAULT_STATE: ClassroomState = {
  studentRowCount: 4,
  seatsPerRow: 10,
  placements: {},
  profiles: {},
};

export function cloneState(state: ClassroomState): ClassroomState {
  return {
    studentRowCount: state.studentRowCount,
    seatsPerRow: state.seatsPerRow,
    placements: { ...state.placements },
    profiles: { ...state.profiles },
  };
}

export function seatKey(zone: Zone, row: number, seat: number): string {
  return `${zone}:${row}:${seat}`;
}

export function parseSeatKey(id: string): SeatRef | null {
  const parts = id.split(":");
  if (parts.length !== 3) {
    return null;
  }
  const zone = parts[0];
  const row = Number(parts[1]);
  const seat = Number(parts[2]);
  if ((zone !== "advisor" && zone !== "student") || !Number.isInteger(row) || !Number.isInteger(seat)) {
    return null;
  }
  return { zone, row, seat };
}

export function isValidSeat(state: ClassroomState, target: SeatRef): boolean {
  if (target.seat < 0 || target.seat >= state.seatsPerRow) {
    return false;
  }
  if (target.zone === "advisor") {
    return target.row === 0;
  }
  if (target.zone === "student") {
    return target.row >= 0 && target.row < state.studentRowCount;
  }
  return false;
}

export function occupantAt(
  state: ClassroomState,
  zone: Zone,
  row: number,
  seat: number,
): string | undefined {
  for (const [personId, placement] of Object.entries(state.placements)) {
    if (placement.zone === zone && placement.row === row && placement.seat === seat) {
      return personId;
    }
  }
  return undefined;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function placePerson(
  state: ClassroomState,
  personId: string,
  target: SeatRef,
): ClassroomState {
  if (!isValidSeat(state, target)) {
    throw new Error("That seat is not on the current table.");
  }

  const next = cloneState(state);
  const occupant = occupantAt(next, target.zone, target.row, target.seat);
  const previous = next.placements[personId];

  if (occupant && occupant !== personId) {
    if (previous) {
      next.placements[occupant] = previous;
    } else {
      delete next.placements[occupant];
    }
  }

  next.placements[personId] = { ...target };
  return next;
}

export function unseatPerson(state: ClassroomState, personId: string): ClassroomState {
  const next = cloneState(state);
  delete next.placements[personId];
  return next;
}

export function setLayout(
  state: ClassroomState,
  studentRowCount: number,
  seatsPerRow: number,
): ClassroomState {
  const next = cloneState(state);
  next.studentRowCount = clamp(studentRowCount, MIN_STUDENT_ROWS, MAX_STUDENT_ROWS);
  next.seatsPerRow = clamp(seatsPerRow, MIN_SEATS_PER_ROW, MAX_SEATS_PER_ROW);

  for (const [personId, placement] of Object.entries(next.placements)) {
    if (!isValidSeat(next, placement)) {
      delete next.placements[personId];
    }
  }

  return next;
}

export function resetSeating(state: ClassroomState): ClassroomState {
  return {
    studentRowCount: state.studentRowCount,
    seatsPerRow: state.seatsPerRow,
    placements: {},
    profiles: { ...state.profiles },
  };
}

export function isSeatRef(value: unknown): value is SeatRef {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const ref = value as SeatRef;
  return (
    (ref.zone === "advisor" || ref.zone === "student") &&
    Number.isInteger(ref.row) &&
    Number.isInteger(ref.seat)
  );
}

function clipText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, MAX_PROFILE_TEXT_LENGTH);
}

function normalizePhoto(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return "";
  }
  if (value.length > MAX_PHOTO_DATA_URL_LENGTH) {
    throw new Error("Photo is too large. Please use a smaller image.");
  }
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value)) {
    throw new Error("Photo must be a JPEG, PNG, or WebP image.");
  }
  return value;
}

export function normalizeProfile(input: unknown): PersonProfile {
  if (typeof input !== "object" || input === null) {
    throw new Error("Invalid profile.");
  }
  const raw = input as Record<string, unknown>;
  return {
    college: clipText(raw.college),
    country: clipText(raw.country),
    hobbies: clipText(raw.hobbies),
    photoDataUrl: normalizePhoto(raw.photoDataUrl ?? ""),
  };
}

export function updateProfile(
  state: ClassroomState,
  personId: string,
  profile: PersonProfile,
): ClassroomState {
  const next = cloneState(state);
  const isEmpty =
    !profile.college && !profile.country && !profile.hobbies && !profile.photoDataUrl;
  if (isEmpty) {
    delete next.profiles[personId];
  } else {
    next.profiles[personId] = profile;
  }
  return next;
}

export function isPersonProfile(value: unknown): value is PersonProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const profile = value as PersonProfile;
  return (
    typeof profile.college === "string" &&
    typeof profile.country === "string" &&
    typeof profile.hobbies === "string" &&
    typeof profile.photoDataUrl === "string" &&
    profile.photoDataUrl.length <= MAX_PHOTO_DATA_URL_LENGTH &&
    (profile.photoDataUrl === "" ||
      /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(profile.photoDataUrl))
  );
}

export function isClassroomState(value: unknown): value is ClassroomState {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const state = value as ClassroomState;
  if (
    !Number.isInteger(state.studentRowCount) ||
    !Number.isInteger(state.seatsPerRow) ||
    typeof state.placements !== "object" ||
    state.placements === null
  ) {
    return false;
  }
  for (const placement of Object.values(state.placements)) {
    if (!isSeatRef(placement)) {
      return false;
    }
  }
  if (state.profiles === undefined) {
    return true;
  }
  if (typeof state.profiles !== "object" || state.profiles === null) {
    return false;
  }
  for (const profile of Object.values(state.profiles)) {
    if (!isPersonProfile(profile)) {
      return false;
    }
  }
  return true;
}

/** Migrate older saved state that lacked profiles. */
export function normalizeLoadedState(value: ClassroomState): ClassroomState {
  return {
    studentRowCount: value.studentRowCount,
    seatsPerRow: value.seatsPerRow,
    placements: value.placements,
    profiles: value.profiles ?? {},
  };
}
