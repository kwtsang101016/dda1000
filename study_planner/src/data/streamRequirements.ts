import type { MajorId, StreamTag } from "./types";

/**
 * Each inner array is one stream course “slot”: taking any code in the array
 * counts as one course toward the stream (e.g. MAT3007 or MAT3007H).
 */
export type StreamCourseGroup = string[];

export interface StreamRequirement {
  id: StreamTag;
  /** Courses that count toward declaring this stream. */
  courses: StreamCourseGroup[];
  /** Minimum distinct groups needed to declare (usually 4). */
  minCourses: number;
  optional: boolean;
}

/** STA depth requirement: ≥3 courses from any one stream (even if not declaring). */
export const STA_DEPTH_MIN = 3;

/** CSE major electives: ≥18 units from group (a) within 27 elective units. */
export const CSE_ELECTIVE_GROUP_A: string[] = [
  "CSC2003",
  "CSC3002",
  "CSC3102",
  "CSC3120",
  "CSC3160",
  "CSC3170",
  "CSC3180",
  "CSC3185",
  "CSC4001",
  "CSC4005",
  "CSC4010",
  "CSC4012",
  "CSC4100",
  "CSC4107",
  "CSC4130",
  "CSC4140",
  "CSC4150",
  "CSC4160",
  "CSC4180",
  "CSC4220",
  "CSC4240",
  "CSC4303",
  "CSC4801",
  "DDA4080",
  "DDA4210",
  "DDA4220",
  "DDA4230",
  "ECE3080",
  "ECE4016",
];

export const CSE_ELECTIVE_GROUP_A_MIN_UNITS = 18;
export const CSE_ELECTIVE_TOTAL_UNITS = 27;

const or = (...codes: string[]): StreamCourseGroup => codes;

export const STREAM_REQUIREMENTS: Record<StreamTag, StreamRequirement> = {
  "cse-ai": {
    id: "cse-ai",
    minCourses: 4,
    optional: true,
    courses: [
      or("CSC3160"),
      or("CSC3180"),
      or("CSC4100"),
      or("CSC4801"),
      or("DDA4210"),
      or("DDA4220"),
      or("DDA4230"),
      or("ECE3060"),
      or("ECE4011"),
      or("ECE4513"),
      or("MAT3007", "MAT3007H"),
    ],
  },
  "ds-method": {
    id: "ds-method",
    minCourses: 4,
    optional: true,
    courses: [
      or("CSC3001"),
      or("DDA3003"),
      or("DDA3005"),
      or("DDA4007"),
      or("DDA4010"),
      or("DDA4080"),
      or("DDA4210"),
      or("DDA4230"),
      or("DDA4240"),
    ],
  },
  "ds-finance": {
    id: "ds-finance",
    minCourses: 4,
    optional: true,
    courses: [
      or("DDA4080"),
      or("ECO3121"),
      or("ECO3160"),
      or("ECO3211"),
      or("ECO4121"),
      or("FIN3080"),
      or("FMA4200"),
      or("FMA4800"),
      or("STA4002"),
      or("STA4003"),
      or("STA4020"),
    ],
  },
  "ds-ops": {
    id: "ds-ops",
    minCourses: 4,
    optional: true,
    courses: [
      or("DDA4080"),
      or("DDA4260"),
      or("DMS2030"),
      or("DMS3210"),
      or("DMS4010"),
      or("DMS4031"),
      or("ECO3160"),
      or("MGT2020"),
      or("MKT4220"),
    ],
  },
  "ds-life": {
    id: "ds-life",
    minCourses: 4,
    optional: true,
    courses: [
      or("BIM2005"),
      or("BIM2006"),
      or("BIM3001"),
      or("BIM3007"),
      or("BIM3009"),
      or("BIO1008"),
      or("BIO3204"),
      or("BIO3213"),
      or("DDA4080"),
      or("STA4012"),
    ],
  },
  "ds-computing": {
    id: "ds-computing",
    minCourses: 4,
    optional: true,
    courses: [
      or("CSC2003"),
      or("CSC3001"),
      or("CSC3002"),
      or("CSC3050"),
      or("CSC3150"),
      or("CSC3160"),
      or("CSC3170"),
      or("CSC4001"),
      or("CSC4005"),
      or("CSC4010"),
      or("CSC4107"),
      or("CSC4120", "CSC4120H"),
      or("CSC4140"),
      or("CSC4150"),
      or("CSC4160"),
      or("CSC4170"),
      or("CSC4801"),
      or("DDA4080"),
      or("DDA4220"),
      or("DDA4310"),
    ],
  },
  "sta-math": {
    id: "sta-math",
    minCourses: 4,
    optional: true,
    courses: [
      or("DDA3005"),
      or("DDA4002"),
      or("DDA4080"),
      or("MAT2002"),
      or("MAT3006"),
      or("MAT3040"),
      or("MAT3220"),
      or("MAT3280"),
      or("STA4001", "STA4001H"),
      or("STA4100"),
    ],
  },
  "sta-method": {
    id: "sta-method",
    minCourses: 4,
    optional: true,
    courses: [
      or("DDA4010"),
      or("DDA4080"),
      or("STA3001"),
      or("STA3006"),
      or("STA3007"),
      or("STA3030"),
      or("STA4002"),
      or("STA4003"),
      or("STA4005"),
      or("STA4030"),
      or("STA4041"),
      or("STA4102"),
    ],
  },
  "sta-biostat": {
    id: "sta-biostat",
    minCourses: 4,
    optional: true,
    courses: [
      or("BIM2005"),
      or("BIM3001"),
      or("BIM3007"),
      or("BIM3009"),
      or("BIO1008"),
      or("DDA4010"),
      or("DDA4080"),
      or("STA4005"),
      or("STA4012"),
      or("STA4030"),
      or("STA4041"),
      or("STA4102"),
      or("STA4606"),
    ],
  },
  "sta-finance": {
    id: "sta-finance",
    minCourses: 4,
    optional: true,
    courses: [
      or("DDA3600"),
      or("DDA4010"),
      or("DDA4080"),
      or("ECO3211"),
      or("FIN3380"),
      or("FMA4200"),
      or("FMA4800"),
      or("MAT2002"),
      or("RMS4001"),
      or("RMS4050"),
      or("RMS4060"),
      or("STA4003"),
      or("STA4020"),
      or("STA4041"),
    ],
  },
  "sta-computing": {
    id: "sta-computing",
    minCourses: 4,
    optional: true,
    courses: [
      or("CSC3002"),
      or("CSC3100"),
      or("CSC4120", "CSC4120H"),
      or("DDA3020", "DDA3020H"),
      or("DDA4010"),
      or("DDA4080"),
      or("DDA4220"),
    ],
  },
  // FE streams are curriculum forks (required specialization), not optional 4-course claims.
  "fe-qf": {
    id: "fe-qf",
    minCourses: 0,
    optional: false,
    courses: [],
  },
  "fe-fintech": {
    id: "fe-fintech",
    minCourses: 0,
    optional: false,
    courses: [],
  },
};

export interface StreamProgress {
  stream: StreamTag;
  matchedCodes: string[];
  count: number;
  minCourses: number;
  satisfied: boolean;
}

export function evaluateStreamProgress(
  stream: StreamTag,
  takenCodes: Iterable<string>,
): StreamProgress {
  const req = STREAM_REQUIREMENTS[stream];
  const taken = new Set(
    [...takenCodes].map((c) => c.trim().toUpperCase()).filter(Boolean),
  );
  const matchedCodes: string[] = [];
  for (const group of req.courses) {
    const hit = group.find((code) => taken.has(code.toUpperCase()));
    if (hit) matchedCodes.push(hit);
  }
  const count = matchedCodes.length;
  return {
    stream,
    matchedCodes,
    count,
    minCourses: req.minCourses,
    satisfied: req.minCourses === 0 || count >= req.minCourses,
  };
}

/** Best STA depth progress across all STA streams (≥3 from any one). */
export function evaluateStaDepth(takenCodes: Iterable<string>): StreamProgress | null {
  const staStreams: StreamTag[] = [
    "sta-math",
    "sta-method",
    "sta-biostat",
    "sta-finance",
    "sta-computing",
  ];
  let best: StreamProgress | null = null;
  for (const id of staStreams) {
    const p = evaluateStreamProgress(id, takenCodes);
    // Depth uses min 3, not declaration min 4
    const depthSatisfied = p.count >= STA_DEPTH_MIN;
    const adjusted: StreamProgress = {
      ...p,
      minCourses: STA_DEPTH_MIN,
      satisfied: depthSatisfied,
    };
    if (!best || adjusted.count > best.count) best = adjusted;
  }
  return best;
}

export function evaluateCseGroupAUnits(
  takenCodes: Iterable<string>,
  unitsFor: (code: string) => number,
): { units: number; min: number; totalTarget: number; satisfied: boolean } {
  const set = new Set(CSE_ELECTIVE_GROUP_A);
  let units = 0;
  for (const code of takenCodes) {
    if (set.has(code)) units += unitsFor(code);
  }
  return {
    units,
    min: CSE_ELECTIVE_GROUP_A_MIN_UNITS,
    totalTarget: CSE_ELECTIVE_TOTAL_UNITS,
    satisfied: units >= CSE_ELECTIVE_GROUP_A_MIN_UNITS,
  };
}

export function claimableStreams(major: MajorId): StreamTag[] {
  if (major === "CSE") return ["cse-ai"];
  if (major === "DSBDT") {
    return ["ds-method", "ds-finance", "ds-ops", "ds-life", "ds-computing"];
  }
  if (major === "STA") {
    return ["sta-math", "sta-method", "sta-biostat", "sta-finance", "sta-computing"];
  }
  return [];
}
