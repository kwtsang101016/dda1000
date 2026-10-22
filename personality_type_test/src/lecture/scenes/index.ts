import type { ComponentType } from "react";
import {
  AboutOtisScene,
  AppleScene,
  BriefHistoryScene,
  DeadlineScene,
  DichotomiesScene,
  EnergyScene,
  FurtherReferenceScene,
  GroupProjectScene,
  JudgingScene,
  LamCoverScene,
  LamSummaryScene,
  LearningImplicationScene,
  LectureScene,
  LimitsScene,
  MakePlanScene,
  MisunderstandingsScene,
  MyersBriggsScene,
  OneWordScene,
  OutcomesScene,
  PreLessonTaskScene,
  PrinciplesOneScene,
  PrinciplesTwoScene,
  RechargeScene,
  SelfVerificationScene,
  SensingScene,
  SixteenTypesScene,
  StudyStrategiesScene,
  TestWebsiteScene,
  ThinkingFeelingScene,
  YourTypeScene,
} from "./slides";

export interface LectureScene {
  id: string;
  chapter: string;
  label: string;
  Scene: ComponentType;
}

const INTRO = "Before the lecture";
const FOUNDATIONS = "Foundations";
const PAIRS = "The four preference pairs";
const YOUR_TYPE = "Verify your type";
const LEARNING = "Personality and study";

export const SCENES: LectureScene[] = [
  { id: "lecture", chapter: INTRO, label: "Decode, Connect, Adapt (16 Oct)", Scene: LectureScene },
  { id: "pre-lesson-task", chapter: INTRO, label: "Pre-lesson task: discover your personality type", Scene: PreLessonTaskScene },
  { id: "lam-cover", chapter: FOUNDATIONS, label: "Know Your Type, Own Your Learning", Scene: LamCoverScene },
  { id: "one-word", chapter: FOUNDATIONS, label: "Activity: ONE word for your first month", Scene: OneWordScene },
  { id: "about-otis", chapter: FOUNDATIONS, label: "About Me — Otis Lam", Scene: AboutOtisScene },
  { id: "misunderstandings", chapter: FOUNDATIONS, label: "Some Common Misunderstandings of MBTI", Scene: MisunderstandingsScene },
  { id: "outcomes", chapter: FOUNDATIONS, label: "Intended Learning Outcomes", Scene: OutcomesScene },
  { id: "history", chapter: FOUNDATIONS, label: "Brief History", Scene: BriefHistoryScene },
  { id: "myers-briggs", chapter: FOUNDATIONS, label: "Myers & Briggs Demonstrated Types", Scene: MyersBriggsScene },
  { id: "principles-1", chapter: FOUNDATIONS, label: "Key Principles (1/2)", Scene: PrinciplesOneScene },
  { id: "principles-2", chapter: FOUNDATIONS, label: "Key Principles (2/2)", Scene: PrinciplesTwoScene },
  { id: "dichotomies", chapter: PAIRS, label: "Dichotomies (二分法)", Scene: DichotomiesScene },
  { id: "energy", chapter: PAIRS, label: "Extraversion vs. Introversion", Scene: EnergyScene },
  { id: "recharge", chapter: PAIRS, label: "Recharge after 3 mid-terms", Scene: RechargeScene },
  { id: "sensing", chapter: PAIRS, label: "Sensing vs. Intuition", Scene: SensingScene },
  { id: "apple", chapter: PAIRS, label: "Look at this image", Scene: AppleScene },
  { id: "thinking-feeling", chapter: PAIRS, label: "Thinking vs. Feeling", Scene: ThinkingFeelingScene },
  { id: "group-project", chapter: PAIRS, label: "Scenario: First-Year Group Project", Scene: GroupProjectScene },
  { id: "judging", chapter: PAIRS, label: "Judging vs. Perceiving", Scene: JudgingScene },
  { id: "deadlines", chapter: PAIRS, label: "Scenario: Managing Term Paper Deadlines", Scene: DeadlineScene },
  { id: "test-website", chapter: YOUR_TYPE, label: "16Personalities", Scene: TestWebsiteScene },
  { id: "limits", chapter: YOUR_TYPE, label: "Limit of the Instruments", Scene: LimitsScene },
  { id: "self-verification", chapter: YOUR_TYPE, label: "Self-Verification Method", Scene: SelfVerificationScene },
  { id: "your-type", chapter: YOUR_TYPE, label: "Activity: Your Type, Verified or Not", Scene: YourTypeScene },
  { id: "learning-implication", chapter: LEARNING, label: "Implication to Your Learning", Scene: LearningImplicationScene },
  { id: "make-a-plan", chapter: LEARNING, label: "Activity: Make a Plan to Try", Scene: MakePlanScene },
  { id: "study-strategies", chapter: LEARNING, label: "Study strategies (Use / Stretch)", Scene: StudyStrategiesScene },
  { id: "summary", chapter: LEARNING, label: "Summary", Scene: LamSummaryScene },
  { id: "sixteen-types", chapter: LEARNING, label: "16 Personality Types — One Big House", Scene: SixteenTypesScene },
  { id: "further-reference", chapter: LEARNING, label: "Further Reference", Scene: FurtherReferenceScene },
];
