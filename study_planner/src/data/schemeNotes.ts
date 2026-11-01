import type { MajorId } from "./types";

/** Official scheme footnotes transcribed for the planner (2026–27). */
export const SCHEME_NOTES: Record<MajorId, string[]> = {
  CSE: [
    "Electives: 27 units from groups (a) and (b), with no less than 18 units from group (a).",
    "[b] Either CSC1001 + CSC1002 or CSC1003 + CSC1004 fulfills the school-package computing requirement. This planner seeds Option B (CSC1003/1004); you may switch both slots to Option A.",
    "[c] Artificial Intelligence stream (optional): declare at expected graduation term by completing no less than 4 courses from the AI stream list. You may graduate with no stream.",
  ],
  DSBDT: [
    "Major electives: any 30 units from the stream course lists, with up to two courses below 3000 level (including 2000-level).",
    "[b] Five optional streams (Methodology and Theory; Finance and Economics; Operations Management; Life Science; Computing). To declare one stream, complete at least 4 courses under it. Only one stream may be declared; declaring none is allowed.",
  ],
  STA: [
    "Depth requirement: all STA students must complete 3 courses from any one stream (even if they do not declare a stream).",
    "Stream declaration (optional): at most one stream; if declared, complete at least 4 courses under it.",
    "[c] STA2001 or STA2001H fulfills the requirement; STA2001H is recommended.",
    "[d] STA2002 or STA2002H fulfills the requirement; STA2002H is recommended.",
  ],
  FE: [
    "FE students must specialize in either Quantitative Finance or FinTech — the required and elective lists differ by stream.",
    "School package alternatives include MAT1001/1011, MAT1002/1012, MAT2040/2041A/2042, and STA2001/2001H.",
    "Several major required courses offer non-H / H alternatives (e.g. DDA3020/3020H, MAT3007/3007H, STA2002/2002H).",
  ],
};
