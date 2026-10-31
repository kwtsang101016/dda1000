import type { MajorId, StreamTag } from "./types";

export const STREAM_LABELS: Record<StreamTag, string> = {
  "cse-ai": "Artificial Intelligence",
  "ds-method": "Methodology and Theory",
  "ds-finance": "Finance and Economics",
  "ds-ops": "Operations Management",
  "ds-life": "Life Science",
  "ds-computing": "Computing",
  "sta-math": "Mathematical Statistics",
  "sta-method": "Statistical Methodology",
  "sta-biostat": "Biostatistics & Bioinformatics",
  "sta-finance": "Financial Statistics",
  "sta-computing": "Computing & Machine Learning",
  "fe-qf": "Quantitative Finance",
  "fe-fintech": "FinTech",
};

export const STREAM_COLORS: Record<StreamTag, string> = {
  "cse-ai": "#6366f1",
  "ds-method": "#0ea5e9",
  "ds-finance": "#f59e0b",
  "ds-ops": "#8b5cf6",
  "ds-life": "#10b981",
  "ds-computing": "#ec4899",
  "sta-math": "#6366f1",
  "sta-method": "#0ea5e9",
  "sta-biostat": "#10b981",
  "sta-finance": "#f59e0b",
  "sta-computing": "#ec4899",
  "fe-qf": "#0ea5e9",
  "fe-fintech": "#ec4899",
};

export const STREAMS_BY_MAJOR: Record<MajorId, StreamTag[]> = {
  CSE: ["cse-ai"],
  DSBDT: ["ds-method", "ds-finance", "ds-ops", "ds-life", "ds-computing"],
  STA: ["sta-math", "sta-method", "sta-biostat", "sta-finance", "sta-computing"],
  FE: ["fe-qf", "fe-fintech"],
};

export const ROLE_LABELS = {
  "school-package": "School package",
  "major-required": "Major required",
  "major-elective": "Major elective",
} as const;
