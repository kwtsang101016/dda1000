import type { ComponentType } from "react";
import {
  AiHelpScene,
  BeforeExamScene,
  CitationScene,
  ConsequencesScene,
  DuringExamScene,
  PlagiarismScene,
  QuizScene,
  RedLinesScene,
  SourcesScene,
  SuspectedCaseScene,
  TitleScene,
  WhyScene,
} from "./slides";

export interface LectureScene {
  id: string;
  chapter: string;
  label: string;
  Scene: ComponentType;
}

export const SCENES: LectureScene[] = [
  { id: "quiz", chapter: "Assessment", label: "Academic Honesty Online Quiz", Scene: QuizScene },
  { id: "title", chapter: "Academic Honesty", label: "Your work. Your sources. Your responsibility.", Scene: TitleScene },
  { id: "why", chapter: "Principles", label: "Why it matters", Scene: WhyScene },
  { id: "red-lines", chapter: "Principles", label: "Know the red lines", Scene: RedLinesScene },
  { id: "plagiarism", chapter: "Assignments", label: "Plagiarism is not only copy–paste", Scene: PlagiarismScene },
  { id: "citation", chapter: "Assignments", label: "The 3-part citation rule", Scene: CitationScene },
  { id: "ai-help", chapter: "Assignments", label: "AI, online help, and paid services", Scene: AiHelpScene },
  { id: "before-exam", chapter: "Exams", label: "Before the exam", Scene: BeforeExamScene },
  { id: "during-exam", chapter: "Exams", label: "During the exam", Scene: DuringExamScene },
  { id: "suspected", chapter: "Cases", label: "If a case is suspected", Scene: SuspectedCaseScene },
  { id: "consequences", chapter: "Cases", label: "Consequences could be serious", Scene: ConsequencesScene },
  { id: "sources", chapter: "Resources", label: "Official sources of policies and regulations", Scene: SourcesScene },
];
