import { useEffect, useMemo, useState } from "react";
import { CoursePattern } from "./components/CoursePattern";
import { CoursePicker } from "./components/CoursePicker";
import { InstallHint } from "./components/InstallHint";
import { MajorSelector } from "./components/MajorSelector";
import { ManualCourseForm } from "./components/ManualCourseForm";
import { MoveTermDialog } from "./components/MoveTermDialog";
import { Notes } from "./components/Notes";
import { RequirementsSummary } from "./components/RequirementsSummary";
import { UcCategoryPicker } from "./components/UcCategoryPicker";
import { FE_STREAM_LABELS, MAJORS } from "./data/majors";
import type { FeStreamId, MajorId, ManualCourse, StreamTag } from "./data/types";
import {
  buildFreeSlots,
  buildMajorSlots,
  buildUcSlots,
  createExtraElectiveSlot,
  effectivePlacement,
  emptyManualAssignments,
  isExtraElectiveSlot,
  seedCatalogAssignments,
  takenCodes,
  type ManualAssignments,
  type PlanAssignments,
  type PlanSlot,
  type SlotPlacements,
  type TermKind,
  type TermPlacement,
} from "./lib/planSlots";
import { downloadPlanPdf } from "./lib/exportPdf";
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
  const [placements, setPlacements] = useState<SlotPlacements>(saved.placements);
  const [summerYears, setSummerYears] = useState<number[]>(saved.summerYears);
  const [claimedStream, setClaimedStream] = useState<StreamTag | null>(
    saved.claimedStream,
  );
  const [freeExtra, setFreeExtra] = useState<PlanSlot[]>([]);
  const [electiveExtra, setElectiveExtra] = useState<PlanSlot[]>(saved.electiveExtra);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [movingSlotId, setMovingSlotId] = useState<string | null>(null);
  const [ucPlaceTarget, setUcPlaceTarget] = useState<TermPlacement | null>(null);

  const ready = major != null && (major !== "FE" || feStream != null);

  const majorSlots = useMemo(() => {
    const seeded = ready && major ? buildMajorSlots(major, feStream) : [];
    return [...seeded, ...electiveExtra];
  }, [ready, major, feStream, electiveExtra]);
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

  const movingSlot = useMemo(
    () => allSlots.find((s) => s.id === movingSlotId) ?? null,
    [allSlots, movingSlotId],
  );

  useEffect(() => {
    savePlannerState({
      major,
      feStream,
      assignments,
      manual,
      placements,
      summerYears,
      claimedStream,
      electiveExtra,
    });
  }, [
    major,
    feStream,
    assignments,
    manual,
    placements,
    summerYears,
    claimedStream,
    electiveExtra,
  ]);

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
      next === "FE" && !nextFe ? {} : seedCatalogAssignments(next, nextFe);
    setMajor(next);
    setFeStream(nextFe);
    setAssignments(seed);
    setManual((prev) => {
      const ucFree = emptyManualAssignments([
        ...buildUcSlots(),
        ...buildFreeSlots(next),
      ]);
      const merged: ManualAssignments = { ...ucFree };
      for (const [id, course] of Object.entries(prev)) {
        if (id.startsWith("uc-") || id.startsWith("free-")) {
          merged[id] = course;
        }
      }
      return merged;
    });
    setPlacements((prev) => {
      const kept: SlotPlacements = {};
      for (const [id, place] of Object.entries(prev)) {
        if (id.startsWith("uc-") || id.startsWith("free-")) {
          kept[id] = place;
        }
      }
      return kept;
    });
    setFreeExtra([]);
    setElectiveExtra([]);
    setClaimedStream(null);
    setActiveSlotId(null);
    setMovingSlotId(null);
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
        "Reset major pattern to the official recommended courses? University Core, Free Electives, Summer rows, and term moves for UC/free stay. Major course term moves reset.",
      )
    ) {
      return;
    }
    setAssignments((prev) => {
      const seed = seedCatalogAssignments(major, feStream);
      const keptExtras: PlanAssignments = {};
      for (const [id, code] of Object.entries(prev)) {
        if (isExtraElectiveSlot(id)) keptExtras[id] = code;
      }
      return { ...seed, ...keptExtras };
    });
    setPlacements((prev) => {
      const kept: SlotPlacements = {};
      for (const [id, place] of Object.entries(prev)) {
        if (id.startsWith("uc-") || id.startsWith("free-") || isExtraElectiveSlot(id)) {
          kept[id] = place;
        }
      }
      return kept;
    });
    setActiveSlotId(null);
    setMovingSlotId(null);
  }

  function handleExport() {
    downloadPlanExport({
      major,
      feStream,
      assignments,
      manual,
      placements,
      summerYears,
      claimedStream,
      electiveExtra,
    });
  }

  async function handleExportPdf() {
    if (!major) return;
    try {
      await downloadPlanPdf({
        major,
        feStream,
        majorSlots,
        ucSlots,
        freeSlots,
        assignments,
        manual,
        placements,
        summerYears,
        claimedStream,
      });
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Could not create the PDF. Please try again.",
      );
    }
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
      setPlacements(imported.placements);
      setSummerYears(imported.summerYears);
      setClaimedStream(imported.claimedStream);
      setElectiveExtra(imported.electiveExtra);
      setFreeExtra([]);
      setActiveSlotId(null);
      setMovingSlotId(null);
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

  function handleRemoveFreeSlot(slotId: string) {
    if (slotId.startsWith("free-extra-")) {
      setFreeExtra((prev) => prev.filter((s) => s.id !== slotId));
    }
    setManual((prev) => {
      const next = { ...prev };
      next[slotId] = null;
      return next;
    });
    setPlacements((prev) => {
      if (!(slotId in prev)) return prev;
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    if (activeSlotId === slotId) setActiveSlotId(null);
    if (movingSlotId === slotId) setMovingSlotId(null);
  }

  function handleRequestPlaceUc(year: number, term: TermKind) {
    setUcPlaceTarget({ year, term });
  }

  function handleConfirmPlaceUc(slotId: string) {
    if (!ucPlaceTarget) return;
    setPlacements((prev) => ({ ...prev, [slotId]: ucPlaceTarget }));
    setUcPlaceTarget(null);
    setActiveSlotId(slotId);
  }

  function handleAddMajorElective(year: number, term: TermKind) {
    const slot = createExtraElectiveSlot(year, term);
    setElectiveExtra((prev) => [...prev, slot]);
    setAssignments((prev) => ({ ...prev, [slot.id]: null }));
    setPlacements((prev) => ({ ...prev, [slot.id]: { year, term } }));
    setActiveSlotId(slot.id);
  }

  function handleRemoveElectiveSlot(slotId: string) {
    if (!isExtraElectiveSlot(slotId)) return;
    setElectiveExtra((prev) => prev.filter((s) => s.id !== slotId));
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    setPlacements((prev) => {
      if (!(slotId in prev)) return prev;
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
    if (activeSlotId === slotId) setActiveSlotId(null);
    if (movingSlotId === slotId) setMovingSlotId(null);
  }

  function handlePlaceFreeInTerm(year: number, term: TermKind) {
    const place = { year, term };
    const existing = freeSlots.find((s) => !placements[s.id]);
    if (existing) {
      setPlacements((prev) => ({ ...prev, [existing.id]: place }));
      setActiveSlotId(existing.id);
      return;
    }
    const id = `free-extra-${Date.now()}`;
    setFreeExtra((prev) => [
      ...prev,
      { id, kind: "free", role: "Free elective", units: 3 },
    ]);
    setManual((prev) => ({ ...prev, [id]: null }));
    setPlacements((prev) => ({ ...prev, [id]: place }));
    setActiveSlotId(id);
  }

  function handleUnplaceSlot(slotId: string) {
    setPlacements((prev) => {
      if (!(slotId in prev)) return prev;
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  }

  function handleRequestMove(slotId: string) {
    setActiveSlotId(null);
    setMovingSlotId(slotId);
  }

  function handleConfirmMove(place: TermPlacement) {
    if (!movingSlotId) return;
    if (place.term === "summer") {
      setSummerYears((prev) =>
        prev.includes(place.year) ? prev : [...prev, place.year].sort((a, b) => a - b),
      );
    }
    setPlacements((prev) => ({ ...prev, [movingSlotId]: place }));
    setMovingSlotId(null);
  }

  function handleAddSummer(year: number) {
    setSummerYears((prev) =>
      prev.includes(year) ? prev : [...prev, year].sort((a, b) => a - b),
    );
  }

  function handleRemoveSummer(year: number) {
    const occupied = Object.entries(placements).some(
      ([, p]) => p.year === year && p.term === "summer",
    );
    const majorInSummer = majorSlots.some((slot) => {
      const p = effectivePlacement(slot, placements);
      return p?.year === year && p.term === "summer";
    });
    if (occupied || majorInSummer) {
      window.alert(
        `Year ${year} Summer still has courses. Move them to another term first, then remove Summer.`,
      );
      return;
    }
    setSummerYears((prev) => prev.filter((y) => y !== year));
  }

  const majorLabel = major ? MAJORS[major].label : null;
  const movingPlace = movingSlot
    ? effectivePlacement(movingSlot, placements)
    : null;
  const activePlace = activeSlot
    ? effectivePlacement(activeSlot, placements)
    : null;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__bg" aria-hidden />
        <div className="hero__inner">
          <p className="hero__brand">SDS Study Planner</p>
          <h1 className="hero__title">Build your 2026–27 study plan</h1>
          <p className="hero__lead">
            Choose CSE, DSBDT, STA, or FE, seed the official recommended pattern,
            then edit and move courses across terms — including optional Summer —
            on the path to 120 units.
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
              remainingUcLabels={ucSlots
                .filter((s) => !placements[s.id])
                .map((s) => s.category ?? "University Core")}
              remainingFreeSlots={freeSlots.filter((s) => !placements[s.id]).length}
              claimedStream={claimedStream}
              onClaimedStreamChange={setClaimedStream}
            />
            <CoursePattern
              major={major}
              feStream={feStream}
              majorSlots={majorSlots}
              ucSlots={ucSlots}
              freeSlots={freeSlots}
              assignments={assignments}
              manual={manual}
              placements={placements}
              summerYears={summerYears}
              onSelectSlot={setActiveSlotId}
              onRequestMove={handleRequestMove}
              onExport={handleExport}
              onExportPdf={handleExportPdf}
              onImportFile={handleImport}
              onReseed={handleReseed}
              onRemoveFreeSlot={handleRemoveFreeSlot}
              onRequestPlaceUc={handleRequestPlaceUc}
              onAddMajorElective={handleAddMajorElective}
              onRemoveElectiveSlot={handleRemoveElectiveSlot}
              onPlaceFreeInTerm={handlePlaceFreeInTerm}
              onUnplaceSlot={handleUnplaceSlot}
              onAddSummer={handleAddSummer}
              onRemoveSummer={handleRemoveSummer}
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
            currentPlace={activePlace}
            onPick={handlePick}
            onClear={handleClearCatalog}
            onMove={() => handleRequestMove(activeSlot.id)}
            onClose={() => setActiveSlotId(null)}
          />
        )}

      {activeSlot && (activeSlot.kind === "uc" || activeSlot.kind === "free") && (
        <ManualCourseForm
          slot={activeSlot}
          current={manual[activeSlot.id] ?? null}
          onSave={handleManualSave}
          onClear={handleManualClear}
          onMove={
            placements[activeSlot.id]
              ? () => handleRequestMove(activeSlot.id)
              : undefined
          }
          onClose={() => setActiveSlotId(null)}
        />
      )}

      {ucPlaceTarget && (
        <UcCategoryPicker
          year={ucPlaceTarget.year}
          term={ucPlaceTarget.term}
          options={ucSlots.filter((s) => !placements[s.id])}
          onPick={handleConfirmPlaceUc}
          onClose={() => setUcPlaceTarget(null)}
        />
      )}

      {movingSlot && (
        <MoveTermDialog
          title={`Move ${
            movingSlot.kind === "uc" || movingSlot.kind === "free"
              ? manual[movingSlot.id]?.code || movingSlot.category || movingSlot.role
              : assignments[movingSlot.id] || movingSlot.role
          }`}
          current={movingPlace}
          summerYears={summerYears}
          onMove={handleConfirmMove}
          onClose={() => setMovingSlotId(null)}
        />
      )}
    </div>
  );
}
