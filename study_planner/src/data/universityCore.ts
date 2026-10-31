/** Blank University Core slots matching the official 36-unit breakdown. */

export interface UcSlotTemplate {
  id: string;
  category: string;
  defaultUnits: number;
}

export const UC_SLOT_TEMPLATES: UcSlotTemplate[] = [
  { id: "uc-chinese", category: "Chinese", defaultUnits: 3 },
  { id: "uc-eng-1", category: "English", defaultUnits: 3 },
  { id: "uc-eng-2", category: "English", defaultUnits: 3 },
  { id: "uc-eng-3", category: "English", defaultUnits: 3 },
  { id: "uc-eng-4", category: "English", defaultUnits: 3 },
  { id: "uc-dai", category: "Digital and AI Literacy", defaultUnits: 1 },
  { id: "uc-ge-1", category: "General Education", defaultUnits: 3 },
  { id: "uc-ge-2", category: "General Education", defaultUnits: 3 },
  { id: "uc-ge-3", category: "General Education", defaultUnits: 3 },
  { id: "uc-ge-4", category: "General Education", defaultUnits: 3 },
  { id: "uc-ge-5", category: "General Education", defaultUnits: 3 },
  { id: "uc-ge-6", category: "General Education", defaultUnits: 3 },
  { id: "uc-pe-1", category: "Physical Education and Health", defaultUnits: 1 },
  { id: "uc-pe-2", category: "Physical Education and Health", defaultUnits: 1 },
];

export const UC_TOTAL_UNITS = UC_SLOT_TEMPLATES.reduce((s, t) => s + t.defaultUnits, 0);
