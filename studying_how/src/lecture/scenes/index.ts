import type { ComponentType } from "react";
import {
  AdaptPeopleScene,
  AdaptSectionScene,
  AiPartnerScene,
  CarryTaskScene,
  ChooseCoursesScene,
  CommitmentsScene,
  CompetitionsScene,
  CoverScene,
  CriticalThinkingScene,
  EachYearScene,
  EnglishScene,
  ExchangeScene,
  ExploreSectionScene,
  GrowSectionScene,
  HumanisticLiteracyScene,
  InternshipScene,
  LearnSectionScene,
  MoreThanKnowledgeScene,
  ResearchScene,
  RhythmScene,
  RouteScene,
  SyllabusScene,
  TurnIntoDirectionScene,
  WeeklyRhythmScene,
  WhatChangesScene,
  WhatExploreScene,
  WhereToLookScene,
  WhichSentenceScene,
} from "./slides";

export interface LectureScene {
  id: string;
  chapter: string;
  label: string;
  Scene: ComponentType;
}

const PART_1 = "01 Adapt";
const PART_2 = "02 Learn";
const PART_3 = "03 Explore";
const PART_4 = "04 Grow";

export const SCENES: LectureScene[] = [
  { id: "cover", chapter: "Opening", label: "Studying at SDS: How?", Scene: CoverScene },
  { id: "route", chapter: "Opening", label: "Four parts, one purpose", Scene: RouteScene },
  { id: "adapt-section", chapter: PART_1, label: "Adapting to University Life", Scene: AdaptSectionScene },
  { id: "which-sentence", chapter: PART_1, label: "Which sentence sounds most like you?", Scene: WhichSentenceScene },
  { id: "what-changes", chapter: PART_1, label: "What changes, and why it feels hard", Scene: WhatChangesScene },
  { id: "rhythm", chapter: PART_1, label: "Build a rhythm and use your support", Scene: RhythmScene },
  { id: "english", chapter: PART_1, label: "Adapt to learning in English", Scene: EnglishScene },
  { id: "learn-section", chapter: PART_2, label: "Academic Learning", Scene: LearnSectionScene },
  { id: "choose-courses", chapter: PART_2, label: "Choose courses with a purpose", Scene: ChooseCoursesScene },
  { id: "syllabus", chapter: PART_2, label: "The course outline/syllabus", Scene: SyllabusScene },
  { id: "weekly-rhythm", chapter: PART_2, label: "Study actively each week", Scene: WeeklyRhythmScene },
  { id: "ai-partner", chapter: PART_2, label: "Use AI as a learning partner", Scene: AiPartnerScene },
  { id: "explore-section", chapter: PART_3, label: "Extracurricular Development", Scene: ExploreSectionScene },
  { id: "what-explore", chapter: PART_3, label: "What can you explore?", Scene: WhatExploreScene },
  { id: "each-year", chapter: PART_3, label: "Each year can have different tasks", Scene: EachYearScene },
  { id: "research", chapter: PART_3, label: "Research begins with readiness", Scene: ResearchScene },
  { id: "internship", chapter: PART_3, label: "Internship", Scene: InternshipScene },
  { id: "exchange", chapter: PART_3, label: "Overseas exchange", Scene: ExchangeScene },
  { id: "competitions", chapter: PART_3, label: "Competitions and projects", Scene: CompetitionsScene },
  { id: "where-to-look", chapter: PART_3, label: "Know where to look", Scene: WhereToLookScene },
  { id: "turn-direction", chapter: PART_3, label: "Turn each experience into direction", Scene: TurnIntoDirectionScene },
  { id: "grow-section", chapter: PART_4, label: "Further Growth", Scene: GrowSectionScene },
  { id: "more-than-knowledge", chapter: PART_4, label: "More than knowledge", Scene: MoreThanKnowledgeScene },
  { id: "humanistic", chapter: PART_4, label: "Humanistic literacy", Scene: HumanisticLiteracyScene },
  { id: "critical-thinking", chapter: PART_4, label: "Critical thinking as a habit", Scene: CriticalThinkingScene },
  { id: "carry-task", chapter: PART_4, label: "Carry a task from idea to outcome", Scene: CarryTaskScene },
  { id: "adapt-people", chapter: PART_4, label: "Adapt to people and situations", Scene: AdaptPeopleScene },
  { id: "commitments", chapter: PART_4, label: "What can you do next?", Scene: CommitmentsScene },
];
