"""Build courseConditions.ts from the UG course-condition workbook."""

import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
XLSX = Path(
    r"C:\Users\曾家炜\Desktop\Courses\Fall 2026-27\DDA1000 Fall2026\UG-本科课程条件信息261102A.xlsx"
)
OUT = ROOT / "src" / "data" / "courseConditions.ts"


def clean(raw: str) -> str:
    text = raw.replace("_x000D_", " ").replace("\r", " ").replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) >= 2 and len(text) % 2 == 0 and text[: len(text) // 2] == text[len(text) // 2 :]:
        text = text[: len(text) // 2].strip()
    changed = True
    while changed:
        changed = False
        match = re.search(r"(.{30,}?)\1", text)
        if match:
            text = (text[: match.start()] + match.group(1) + text[match.end() :]).strip()
            changed = True
    text = re.sub(r":(?=\S)", ": ", text)
    text = re.sub(r"\bor(?=[A-Z])", "or ", text)
    text = re.sub(
        r"(?<!\d\.)\s+(?=(?:Corequisite|Co-requisite|Exclusion|Prerequisite|Pre-requisite)\b)",
        "; ",
        text,
    )
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main() -> None:
    workbook = openpyxl.load_workbook(XLSX, data_only=True)
    sheet = workbook.active
    conditions: dict[str, str] = {}
    for row in sheet.iter_rows(min_row=2, values_only=True):
        code = str(row[2] or "").strip().upper()
        description = clean(str(row[4] or ""))
        if code and description:
            conditions[code] = description

    lines = [
        "/**",
        " * Enrolment conditions from UG course-condition workbook (261102A),",
        " * column Long Description. Whitespace cleaned; duplicated paste removed.",
        " */",
        "export const COURSE_CONDITIONS: Record<string, string> = {",
    ]
    for code in sorted(conditions):
        lines.append(f"  {json.dumps(code)}: {json.dumps(conditions[code], ensure_ascii=False)},")
    lines.append("};")
    lines.append("")
    lines.append("export function courseCondition(code: string | null | undefined): string | null {")
    lines.append("  if (!code) return null;")
    lines.append("  const key = code.trim().toUpperCase();")
    lines.append("  return COURSE_CONDITIONS[key] ?? null;")
    lines.append("}")
    lines.append("")
    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {len(conditions)} conditions to {OUT}")


if __name__ == "__main__":
    main()
