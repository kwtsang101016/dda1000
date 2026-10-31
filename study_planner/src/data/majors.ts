import type { FeStreamId, MajorId } from "./types";

export interface MajorInfo {
  id: MajorId;
  label: string;
  shortLabel: string;
  majorUnits: number;
  lastUpdate: string;
  needsFeStream?: boolean;
}

export const MAJORS: Record<MajorId, MajorInfo> = {
  CSE: {
    id: "CSE",
    label: "Computer Science and Engineering",
    shortLabel: "CSE",
    majorUnits: 70,
    lastUpdate: "20 July 2026",
  },
  DSBDT: {
    id: "DSBDT",
    label: "Data Science and Big Data Technology",
    shortLabel: "DSBDT",
    majorUnits: 71,
    lastUpdate: "20 July 2026",
  },
  STA: {
    id: "STA",
    label: "Statistics",
    shortLabel: "STA",
    majorUnits: 70,
    lastUpdate: "20 July 2026",
  },
  FE: {
    id: "FE",
    label: "Financial Engineering",
    shortLabel: "FE",
    majorUnits: 70,
    lastUpdate: "6 May 2026",
    needsFeStream: true,
  },
};

export const MAJOR_ORDER: MajorId[] = ["CSE", "DSBDT", "STA", "FE"];

export const FE_STREAM_LABELS: Record<FeStreamId, string> = {
  qf: "Quantitative Finance",
  fintech: "FinTech",
};

export const UNIVERSITY_CORE_UNITS = 36;
export const GRADUATION_TOTAL = 120;

export function freeElectiveUnits(major: MajorId): number {
  return GRADUATION_TOTAL - UNIVERSITY_CORE_UNITS - MAJORS[major].majorUnits;
}
