import { useEffect, useMemo, useState } from "react";
import { CoursePattern } from "./components/CoursePattern";
import { CoursePicker } from "./components/CoursePicker";
import { InstallHint } from "./components/InstallHint";
import { MajorSelector } from "./components/MajorSelector";
import { ManualCourseForm } from "./components/ManualCourseForm";
import { Notes } from "./components/Notes";
import { RequirementsSummary } from "./components/RequirementsSummary";
import { FE_STREAM_LABELS, MAJORS } from "./data/majors";
import type { FeStreamId, MajorId, ManualCourse } from "./data/types";
import {
  buildFreeSlots,
  buildMajorSlots,
  buildUcSlots,
  emptyManualAssignments,
  seedCatalogAssignments,
  takenCodes,
  type ManualAssignments,
  type PlanAssignments,
  type PlanSlot,
} from "./lib/planSlots";
import {
  downloadPlanExport,
  importPlanFromFile,
  loadSavedState,
  savePlannerState,
} from "./lib/storage";
import "./App.css";

const NAV = [
  { id: "major", label: "Major" },
  { id: "requirements", label: "Requirements" },
  { id: "pattern", label: "Your plan" },
  { id: "notes", label: "Notes" },
];

export default function App() {
  const saved = loadSavedState();
  const [major, setMajor] = useState<MajorId | null>(saved.major);
  const [feStream, setFeStream] = useState<FeStreamId | null>(saved.feStream);
  const [assignments, setAssignments] = useState<PlanAssignments>(saved.assignments);
  const [manual, setManual] = useState<ManualAssignments>(saved.manual);
  const [freeExtra, setFreeExtra] = useState<PlanSlot[]>([]);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  const ready =
    major != null && (major !== "FE" || feStream != null);

  const majorSlots = useMemo(
    () => (ready && major ? buildMajorSlots(major, feStream) : []),
    [ready, major, feStream],
  );
  const ucSlots = useMemo(() => buildUcSlots(), []);
  const baseFreeSlots = useMemo(
    () => (major ? buildFreeSlots(major) : []),
    [major],
  );
  const freeSlots = useMemo(
    () => [...baseFreeSlots, ...freeExtra],
    [baseFreeSlots, freeExtra],
  );

  const allSlots = useMemo(
    () => [...majorSlots, ...ucSlots, ...freeSlots],
    [majorSlots, ucSlots, freeSlots],
  );

  const activeSlot = useMemo(
    () => allSlots.find((s) => s.id === activeSlotId) ?? null,
    [allSlots, activeSlotId],
  );

  useEffect(() => {
    savePlannerState({ major, feStream, assignments, manual });
  }, [major, feStream, assignments, manual]);

  function confirmReseed(): boolean {
    return window.confirm(
      "Change major / specialization? This re-seeds the recommended major pattern. University Core and Free Elective entries you typed will be kept.",
    );
  }

  function applyMajor(next: MajorId, nextFe: FeStreamId | null) {
    if (major && (major !== next || feStream !== nextFe) && !confirmReseed()) {
      return;
    }
    const seed =
      next === "FE" && !nextFe
        ? {}
        : seedCatalogAssignments(next, nextFe);
    setMajor(next);
    setFeStream(nextFe);
    setAssignments(seed);
    setManual((prev) => {
      const ucFree = emptyManualAssignments([
        ...buildUcSlots(),
        ...buildFreeSlots(next),
      ]);
      // Keep previous UC / free manual entries by id when present.
      const merged: ManualAssignments = { ...ucFree };
      for (const [id, course] of Object.entries(prev)) {
        if (id.startsWith("uc-") || id.startsWith("free-")) {
          merged[id] = course;
        }
      }
      return merged;
    });
    setFreeExtra([]);
    setActiveSlotId(null);
  }

  function handleMajorChange(next: MajorId) {
    if (next === "FE") {
      applyMajor(next, feStream && major === "FE" ? feStream : null);
    } else {
      applyMajor(next, null);
    }
  }

  function handleFeStreamChange(next: FeStreamId) {
    applyMajor("FE", next);
  }

  function handleReseed() {
    if (!major || (major === "FE" && !feStream)) return;
    if (
      !window.confirm(
        "Reset major pattern to the official recommended courses? University Core and Free Electives stay.",
      )
    ) {
      return;
    }
    setAssignments(seedCatalogAssignments(major, feStream));
    setActiveSlotId(null);
  }

  function handleExport() {
    downloadPlanExport({ major, feStream, assignments, manual });
  }

  async function handleImport(file: File) {
    if (
      !window.confirm(
        "Import this plan file? It will replace your major, specialization, and course choices in this browser.",
      )
    ) {
      return;
    }
    try {
      const imported = await importPlanFromFile(file);
      setMajor(imported.major);
      setFeStream(imported.feStream);
      setAssignments(imported.assignments);
      setManual(imported.manual);
      setFreeExtra([]);
      setActiveSlotId(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Import failed.");
    }
  }

  function handlePick(code: string) {
    if (!activeSlotId) return;
    setAssignments((prev) => ({ ...prev, [activeSlotId]: code }));
    setActiveSlotId(null);
  }

  function handleClearCatalog() {
    if (!activeSlotId) return;
    setAssignments((prev) => ({ ...prev, [activeSlotId]: null }));
    setActiveSlotId(null);
  }

  function handleManualSave(course: ManualCourse) {
    if (!activeSlotId) return;
    setManual((prev) => ({ ...prev, [activeSlotId]: course }));
    setActiveSlotId(null);
  }

  function handleManualClear() {
    if (!activeSlotId) return;
    setManual((prev) => ({ ...prev, [activeSlotId]: null }));
    setActiveSlotId(null);
  }

  function handleAddFreeSlot() {
    const n = freeSlots.length + 1;
    const id = `free-extra-${Date.now()}`;
    setFreeExtra((prev) => [
      ...prev,
      { id, kind: "free", role: "Free elective", units: 3 },
    ]);
    setManual((prev) => ({ ...prev, [id]: null }));
    void n;
  }

  function handleRemoveFreeSlot(slotId: string) {
    if (slotId.startsWith("free-extra-")) {
      setFreeExtra((prev) => prev.filter((s) => s.id !== slotId));
    }
    setManual((prev) => {
      const next = { ...prev };
      next[slotId] = null;
      return next;
    });
    if (activeSlotId === slotId) setActiveSlotId(null);
  }

  const majorLabel = major ? MAJORS[major].label : null;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__bg" aria-hidden />
        <div className="hero__inner">
          <p className="hero__brand">SDS Study Planner</p>
          <h1 className="hero__title">Build your 2026–27 study plan</h1>
          <p className="hero__lead">
            Choose CSE, DSBDT, STA, or FE, seed the official recommended pattern,
            then edit every slot. University Core and Free Electives fill the path
            to 120 units.
          </p>
          <p className="hero__meta">
            {majorLabel
              ? `${majorLabel}${
                  major === "FE" && feStream
                    ? ` · ${FE_STREAM_LABELS[feStream]}`
                    : ""
                }`
              : "Pick a major to get started"}{" "}
            · DDA1000 planning aid · verify with advisor / Registry
          </p>
          <nav className="hero__nav" aria-label="Sections">
            {NAV.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="main">
        <MajorSelector
          major={major}
          feStream={feStream}
          onMajorChange={handleMajorChange}
          onFeStreamChange={handleFeStreamChange}
        />

        {ready && major && (
          <>
            <RequirementsSummary
              major={major}
              feStream={feStream}
              majorSlots={majorSlots}
              assignments={assignments}
              manual={manual}
            />
            <CoursePattern
              major={major}
              feStream={feStream}
              majorSlots={majorSlots}
              ucSlots={ucSlots}
              freeSlots={freeSlots}
              assignments={assignments}
              manual={manual}
              onSelectSlot={setActiveSlotId}
              onExport={handleExport}
              onImportFile={handleImport}
              onReseed={handleReseed}
              onAddFreeSlot={handleAddFreeSlot}
              onRemoveFreeSlot={handleRemoveFreeSlot}
            />
          </>
        )}

        {major === "FE" && !feStream && (
          <p className="fe-prompt">
            Select Quantitative Finance or FinTech above to seed your FE pattern.
          </p>
        )}

        <Notes />
        <InstallHint />
      </main>

      <footer className="footer">
        <p>
          Not an official registration tool. Course lists follow the 2026–27 SDS
          study schemes; always confirm with your academic advisor and the Registry.
        </p>
      </footer>

      {activeSlot &&
        major &&
        (activeSlot.kind === "catalog" || activeSlot.kind === "elective") && (
          <CoursePicker
            slot={activeSlot}
            major={major}
            taken={takenCodes(majorSlots, assignments, activeSlot.id)}
            currentCode={assignments[activeSlot.id] ?? null}
            onPick={handlePick}
            onClear={handleClearCatalog}
            onClose={() => setActiveSlotId(null)}
          />
        )}

      {activeSlot && (activeSlot.kind === "uc" || activeSlot.kind === "free") && (
        <ManualCourseForm
          slot={activeSlot}
          current={manual[activeSlot.id] ?? null}
          onSave={handleManualSave}
          onClear={handleManualClear}
          onClose={() => setActiveSlotId(null)}
        />
      )}
    </div>
  );
}
