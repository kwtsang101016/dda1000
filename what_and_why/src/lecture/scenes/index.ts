import type { ComponentType } from "react";
import {
  AbilitiesScene,
  AskYourselfScene,
  ComputerScienceScene,
  ConsequencesScene,
  CoverScene,
  CurriculumScene,
  DataScienceScene,
  DataToDecisionsScene,
  DeterministicScene,
  FinalThoughtScene,
  FinanceScene,
  FinancialEngineeringScene,
  PathsScene,
  ReadyScene,
  ReasonScene,
  SchoolPackageScene,
  SpineScene,
  StatisticsScene,
  UncertaintyScene,
  WeakSignalsScene,
  WorldChangesScene,
} from "./slides";

export interface LectureScene {
  id: string;
  chapter: string;
  label: string;
  Scene: ComponentType;
}

const PART_1 = "Data, uncertainty, and decisions";
const PART_2 = "SDS majors and FE pathway";

export const SCENES: LectureScene[] = [
  { id: "cover", chapter: "Cover", label: "From Data to Decisions: What and Why", Scene: CoverScene },
  { id: "reason", chapter: PART_1, label: "You chose SDS or FE for a reason", Scene: ReasonScene },
  { id: "data-to-decisions", chapter: PART_1, label: "From Data to Decisions", Scene: DataToDecisionsScene },
  { id: "deterministic", chapter: PART_1, label: "Some problems are deterministic", Scene: DeterministicScene },
  { id: "uncertainty", chapter: PART_1, label: "Most real-world decisions involve uncertainty", Scene: UncertaintyScene },
  { id: "world-changes", chapter: PART_1, label: "When the world changes", Scene: WorldChangesScene },
  { id: "weak-signals", chapter: PART_1, label: "High-dimensional data, weak signals", Scene: WeakSignalsScene },
  { id: "finance", chapter: PART_1, label: "Why finance is a special data environment", Scene: FinanceScene },
  { id: "consequences", chapter: PART_1, label: "Models do not end with predictions", Scene: ConsequencesScene },
  { id: "curriculum", chapter: PART_1, label: "Why does the curriculum look broad?", Scene: CurriculumScene },
  { id: "abilities", chapter: PART_1, label: "What abilities are we trying to build?", Scene: AbilitiesScene },
  { id: "paths", chapter: PART_1, label: "Different paths, shared foundations", Scene: PathsScene },
  { id: "ask-yourself", chapter: PART_1, label: "Ask yourself", Scene: AskYourselfScene },
  { id: "ready", chapter: PART_1, label: "Now we are ready to discuss the pathways", Scene: ReadyScene },
  { id: "school-package", chapter: PART_2, label: "School Package courses help you discover a major", Scene: SchoolPackageScene },
  { id: "cs", chapter: PART_2, label: "Computer Science in the AI era", Scene: ComputerScienceScene },
  { id: "ds", chapter: PART_2, label: "Data Science in the AI era", Scene: DataScienceScene },
  { id: "stat", chapter: PART_2, label: "Statistics in the AI era", Scene: StatisticsScene },
  { id: "fe", chapter: PART_2, label: "Financial Engineering as a pathway", Scene: FinancialEngineeringScene },
  { id: "spine", chapter: PART_2, label: "Choose the spine you can sustain", Scene: SpineScene },
  { id: "final-thought", chapter: PART_2, label: "Final thought", Scene: FinalThoughtScene },
];
