/**
 * University Core (36 units) for students admitted 2025–26 and thereafter.
 * Source: Academic Curriculum of the Undergraduate Programmes
 * (Circular AB2025_C037, last update 12 August 2025).
 * GE detail: GE Study Scheme 2023–24 and thereafter (3rd 2023).
 *
 * SDS / SSE / SAI take ENG2002S (Science & Engineering Communication).
 */

export interface UcSlotTemplate {
  id: string;
  /** Short label shown in the picker / timeline. */
  category: string;
  /** Group heading for the UC picker. */
  group: string;
  defaultUnits: number;
  /** Typical course code students enter (may be a series like PED11XX). */
  suggestedCode?: string;
  suggestedTitle?: string;
  /** Extra guidance shown in the picker / form. */
  hint?: string;
}

export const UC_SLOT_TEMPLATES: UcSlotTemplate[] = [
  {
    id: "uc-chinese",
    group: "University Language (15u)",
    category: "CHI1000 Chinese",
    defaultUnits: 3,
    suggestedCode: "CHI1000",
    suggestedTitle: "Chinese",
  },
  {
    id: "uc-eng-1",
    group: "University Language (15u)",
    category: "ENG1001 English Bridge Program",
    defaultUnits: 3,
    suggestedCode: "ENG1001",
    suggestedTitle: "English Bridge Program (EBP)",
    hint: "May be exempted under University Core English policies (see HSS).",
  },
  {
    id: "uc-eng-2",
    group: "University Language (15u)",
    category: "ENG1002 English for Academic Purposes I",
    defaultUnits: 3,
    suggestedCode: "ENG1002",
    suggestedTitle: "English for Academic Purposes I",
  },
  {
    id: "uc-eng-3",
    group: "University Language (15u)",
    category: "ENG2001 English for Academic Purposes II",
    defaultUnits: 3,
    suggestedCode: "ENG2001",
    suggestedTitle: "English for Academic Purposes II",
  },
  {
    id: "uc-eng-4",
    group: "University Language (15u)",
    category: "ENG2002S Science & Engineering Communication",
    defaultUnits: 3,
    suggestedCode: "ENG2002S",
    suggestedTitle: "English for Science and Engineering Communication",
    hint: "Required path for SDS / SSE / SAI / MED (non-CMED). SME takes ENG2002B; HSS non-language majors take ENG2002H.",
  },
  {
    id: "uc-dai",
    group: "Digital and AI Literacy (1u)",
    category: "DAI1000 Digital and AI Literacy",
    defaultUnits: 1,
    suggestedCode: "DAI1000",
    suggestedTitle: "Digital and AI Literacy",
    hint: "Unless exempted, register in Year 1. Priority for Year 1 students.",
  },
  {
    id: "uc-pe-1",
    group: "PE and Health (2u)",
    category: "PED11XX Physical Education",
    defaultUnits: 1,
    suggestedCode: "PED11XX",
    suggestedTitle: "Physical Education",
    hint: "Take one course from the PED11XX series.",
  },
  {
    id: "uc-pe-2",
    group: "PE and Health (2u)",
    category: "PED12XX Fitness and Health",
    defaultUnits: 1,
    suggestedCode: "PED12XX",
    suggestedTitle: "Fitness and Health",
    hint: "Take one course from the PED12XX series.",
  },
  {
    id: "uc-ge-1",
    group: "General Education (18u)",
    category: "GFH1000 In Dialogue with Humanity",
    defaultUnits: 3,
    suggestedCode: "GFH1000",
    suggestedTitle: "Foundation: In Dialogue with Humanity",
    hint: "Compulsory GE Foundation (GEF). Recommended before Year 3.",
  },
  {
    id: "uc-ge-2",
    group: "General Education (18u)",
    category: "GFN1000 In Dialogue with Nature",
    defaultUnits: 3,
    suggestedCode: "GFN1000",
    suggestedTitle: "Foundation: In Dialogue with Nature",
    hint: "Compulsory GE Foundation (GEF). Recommended before Year 3.",
  },
  {
    id: "uc-ge-3",
    group: "General Education (18u)",
    category: "GEA Area A · Chinese Cultural Heritage",
    defaultUnits: 3,
    suggestedCode: "GEA",
    suggestedTitle: "Area A: Chinese Cultural Heritage",
    hint: "Any GEA elective (3u). One course from each of Areas A–D is required.",
  },
  {
    id: "uc-ge-4",
    group: "General Education (18u)",
    category: "GEB Area B · Nature, Science and Technology",
    defaultUnits: 3,
    suggestedCode: "GEB",
    suggestedTitle: "Area B: Nature, Science and Technology",
    hint: "Any GEB elective (3u). One course from each of Areas A–D is required.",
  },
  {
    id: "uc-ge-5",
    group: "General Education (18u)",
    category: "GEC Area C · Society and Culture",
    defaultUnits: 3,
    suggestedCode: "GEC",
    suggestedTitle: "Area C: Society and Culture",
    hint: "Any GEC elective (3u). One course from each of Areas A–D is required.",
  },
  {
    id: "uc-ge-6",
    group: "General Education (18u)",
    category: "GED Area D · Self and Humanity",
    defaultUnits: 3,
    suggestedCode: "GED",
    suggestedTitle: "Area D: Self and Humanity",
    hint: "Any GED elective (3u). One course from each of Areas A–D is required.",
  },
];

export const UC_TOTAL_UNITS = UC_SLOT_TEMPLATES.reduce((s, t) => s + t.defaultUnits, 0);

/** Compact breakdown for the Requirements summary bar. */
export const UC_BREAKDOWN_LABEL =
  "Language 15 (CHI1000 + ENG1001/1002/2001/2002S) + DAI1000 (1) + PE&Health 2 (PED11XX + PED12XX) + GE 18 (GFH + GFN + GEA/B/C/D)";

/**
 * University Core / GE notes shown under Requirements for every major.
 * GEW is optional and not a required UC slot.
 */
export const UNIVERSITY_CORE_NOTES: string[] = [
  "University Core totals 36 units (2025–26 curriculum): University Language 15 + Digital & AI Literacy 1 + PE & Health 2 + General Education 18.",
  "SDS students take ENG2002S (English for Science and Engineering Communication) as the fourth English course — not ENG2002B/H.",
  "GE (18u): compulsory foundations GFH1000 (In Dialogue with Humanity) and GFN1000 (In Dialogue with Nature), plus at least one 3u course from each of Areas A (GEA), B (GEB), C (GEC), and D (GED).",
  "GEW (Wide Area) courses are not required for UC graduation. After taking GEW, you may apply to count up to 6 units as Free Elective.",
  "GE enrolment: no University GE in Year 1 Term 1; from Year 1 Term 2 onward, at most two GE courses per regular term (one GEF + one GEE, or two GEE after both GEF are done); at most two GE in Summer.",
  "Finish both GEF courses before the start of Year 3 when possible. You cannot use a GE course related to your major to fulfill the University GE requirement (see the official Course List exclusions).",
  "DAI1000: unless exempted, register in the first year of attendance.",
];

export function ucTemplateById(id: string): UcSlotTemplate | undefined {
  return UC_SLOT_TEMPLATES.find((t) => t.id === id);
}
