/** Course schedule for DDA1000 Fall 2026–27 (from the CAT arrangement page). */

export type EventKind = "separate" | "joint" | "small-group";

export interface CourseEvent {
  /** ISO date YYYY-MM-DD */
  date: string;
  title: string;
  kind: EventKind;
  venue?: string;
  /** Extra line shown in the day panel (speaker, deadlines, …) */
  note?: string;
  /** Highlight in red (journal submissions, etc.) */
  special?: boolean;
  /** Optional attendance snapshot under public/attendance/{file} */
  attendanceFile?: string;
}

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  separate: "Separate",
  joint: "Joint",
  "small-group": "Small group",
};

export const EVENT_KINDS: EventKind[] = ["separate", "joint", "small-group"];

const SEPARATE_VENUE = "Designated classrooms · L12: Teaching D 113";

export const COURSE_EVENTS: CourseEvent[] = [
  {
    date: "2026-09-11",
    title: "Getting to know people",
    kind: "separate",
    venue: SEPARATE_VENUE,
    attendanceFile: "2026-09-11.json",
  },
  { date: "2026-09-18", title: "My university", kind: "joint", venue: "Conference Complex II" },
  {
    date: "2026-10-09",
    title: "Studying at SDS — What and Why",
    kind: "separate",
    venue: SEPARATE_VENUE,
  },
  {
    date: "2026-10-16",
    title: "Decode, Connect, Adapt: Personality Types at University",
    kind: "joint",
    venue: "Liwen Hall",
    note: "Dr. Yiu Man Lam · CLEAR, CUHK",
  },
  {
    date: "2026-10-23",
    title: "Studying at SDS — How",
    kind: "separate",
    venue: SEPARATE_VENUE,
  },
  {
    date: "2026-10-30",
    title: "A.I. and Its Challenges",
    kind: "joint",
    venue: "Liwen Hall",
    note: "Prof. Paolo Di Leo · Philosophy, Singapore University of Technology and Design",
  },
  {
    date: "2026-10-30",
    title: "Course journal — first submission",
    kind: "joint",
    note: "Returned to you on 6 November",
    special: true,
  },
  {
    date: "2026-11-06",
    title: "My own study plan",
    kind: "separate",
    venue: SEPARATE_VENUE,
    note: "Course journals returned",
  },
  { date: "2026-11-13", title: "Off-campus activities", kind: "joint", venue: "Venue TBC" },
  {
    date: "2026-11-20",
    title: "Advisor–student meetings",
    kind: "small-group",
    venue: "Designated classrooms",
  },
  {
    date: "2026-11-27",
    title: "Advisor–student meetings",
    kind: "small-group",
    venue: "Designated classrooms",
  },
  {
    date: "2026-12-04",
    title: "Advisor–student meetings",
    kind: "small-group",
    venue: "Designated classrooms",
  },
  {
    date: "2026-12-11",
    title: "Advisor–student meetings",
    kind: "small-group",
    venue: "Designated classrooms",
  },
  {
    date: "2026-12-11",
    title: "Course journal — final submission",
    kind: "small-group",
    special: true,
  },
];

export function eventsByDate(events: CourseEvent[]): Map<string, CourseEvent[]> {
  const map = new Map<string, CourseEvent[]>();
  for (const event of events) {
    const list = map.get(event.date) ?? [];
    list.push(event);
    map.set(event.date, list);
  }
  return map;
}

export function isSpecialEvent(event: CourseEvent): boolean {
  return Boolean(event.special);
}

/** The session type of a day, ignoring deadline-only entries. */
export function primaryKind(events: CourseEvent[]): EventKind | null {
  return (events.find((event) => !event.special) ?? events[0])?.kind ?? null;
}
