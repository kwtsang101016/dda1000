import type { FeStreamId, MajorId, PatternRow, RoleTag } from "./types";

function row(
  year: number,
  term: 1 | 2,
  role: RoleTag,
  groups: string[][],
  electiveSlots = 0,
): PatternRow {
  return {
    year,
    term,
    label: term === 1 ? "1st term" : "2nd term",
    role,
    groups,
    electiveSlots: electiveSlots || undefined,
  };
}

const CSE: PatternRow[] = [
  row(1, 1, "school-package", [["CSC1003"], ["DDA1000"], ["MAT1001", "MAT1011"]]),
  row(1, 2, "school-package", [
    ["CSC1004"],
    ["DDA2001"],
    ["MAT1002", "MAT1012"],
    ["MAT2041", "MAT2041A"],
  ]),
  row(2, 1, "school-package", [["PHY1001"]]),
  row(2, 1, "major-required", [["CSC3001"], ["CSC3200"]]),
  row(2, 2, "school-package", [["STA2001", "STA2001H"]]),
  row(2, 2, "major-required", [["CSC3060"]]),
  row(2, 2, "major-elective", [], 1),
  row(3, 1, "major-required", [["CSC3150"], ["CSC4120", "CSC4120H"]]),
  row(3, 1, "major-elective", [], 1),
  row(3, 2, "major-required", [["DDA3020", "DDA3020H"]]),
  row(3, 2, "major-elective", [], 2),
  row(4, 1, "major-elective", [], 3),
  row(4, 2, "major-elective", [], 2),
];

const DSBDT: PatternRow[] = [
  row(1, 1, "school-package", [["CSC1001"], ["DDA1000"], ["MAT1001", "MAT1011"]]),
  row(1, 2, "school-package", [
    ["CSC1002"],
    ["DDA2001"],
    ["MAT1002", "MAT1012"],
    ["MAT2041", "MAT2041A"],
  ]),
  row(2, 1, "school-package", [["PHY1001"], ["STA2001", "STA2001H"]]),
  row(2, 1, "major-required", [["CSC3100"]]),
  row(2, 2, "major-required", [
    ["DDA3020", "DDA3020H"],
    ["MAT3007", "MAT3007H"],
    ["STA2002", "STA2002H"],
  ]),
  row(3, 1, "major-required", [["STA4001", "STA4001H"]]),
  row(3, 1, "major-elective", [], 2),
  row(3, 2, "major-required", [["DDA4002"]]),
  row(3, 2, "major-elective", [], 2),
  row(4, 1, "major-elective", [], 3),
  row(4, 2, "major-elective", [], 3),
];

const STA: PatternRow[] = [
  row(1, 1, "school-package", [["CSC1001"], ["DDA1000"], ["MAT1001", "MAT1011"]]),
  row(1, 2, "school-package", [
    ["CSC1002"],
    ["DDA2001"],
    ["MAT1002", "MAT1012"],
    ["MAT2041", "MAT2041A"],
  ]),
  row(2, 1, "school-package", [["PHY1001"], ["STA2001H"]]),
  row(2, 1, "major-required", [["MAT2050"]]),
  row(2, 2, "major-required", [["MAT3007", "MAT3007H"], ["STA2002H"]]),
  row(2, 2, "major-elective", [], 1),
  row(3, 1, "major-required", [["STA3042"]]),
  row(3, 1, "major-elective", [], 2),
  row(3, 2, "major-required", [["STA3005"], ["STA3020"]]),
  row(3, 2, "major-elective", [], 1),
  row(4, 1, "major-elective", [], 3),
  row(4, 2, "major-elective", [], 3),
];

/** Quantitative Finance recommended pattern ([1] courses). */
const FE_QF: PatternRow[] = [
  row(1, 1, "school-package", [["CSC1001"], ["ECO2011"], ["MAT1001", "MAT1011"]]),
  row(1, 2, "school-package", [
    ["ACT2111"],
    ["CSC1002"],
    ["FIN2010"],
    ["MAT1002", "MAT1012"],
    ["STA2001", "STA2001H"],
  ]),
  row(2, 1, "school-package", [["MAT2040", "MAT2041A", "MAT2042"]]),
  row(2, 1, "major-required", [["ECO3121"], ["STA2002", "STA2002H"]]),
  row(2, 2, "major-required", [["FIN3080"], ["MAT2002"]]),
  row(2, 2, "major-elective", [], 1),
  row(3, 1, "major-required", [["FIN3210"], ["FMA4200"], ["MAT3007", "MAT3007H"]]),
  row(3, 2, "major-required", [["DDA3020", "DDA3020H"], ["FIN4110"]]),
  row(4, 1, "major-required", [["FIN4120"]]),
  row(4, 1, "major-elective", [], 2),
  row(4, 2, "major-elective", [], 2),
];

/** FinTech recommended pattern ([2] courses). */
const FE_FINTECH: PatternRow[] = [
  row(1, 1, "school-package", [["CSC1001"], ["ECO2011"], ["MAT1001", "MAT1011"]]),
  row(1, 2, "school-package", [
    ["ACT2111"],
    ["CSC1002"],
    ["FIN2010"],
    ["MAT1002", "MAT1012"],
    ["STA2001", "STA2001H"],
  ]),
  row(2, 1, "school-package", [["MAT2040", "MAT2041A", "MAT2042"]]),
  row(2, 1, "major-required", [["ECO3121"]]),
  row(2, 1, "major-elective", [], 1),
  row(2, 2, "major-required", [["FIN3080"], ["STA2002", "STA2002H"]]),
  row(2, 2, "major-elective", [], 1),
  row(3, 1, "major-required", [
    ["CSC3100"],
    ["ECO3080"],
    ["FIN3210"],
    ["MAT3007", "MAT3007H"],
  ]),
  row(3, 2, "major-required", [["FIN4180"]]),
  row(3, 2, "major-elective", [], 1),
  row(4, 1, "major-elective", [], 2),
  row(4, 2, "major-elective", [], 2),
];

export function getPattern(major: MajorId, feStream?: FeStreamId | null): PatternRow[] {
  if (major === "CSE") return CSE;
  if (major === "DSBDT") return DSBDT;
  if (major === "STA") return STA;
  if (feStream === "fintech") return FE_FINTECH;
  return FE_QF;
}
