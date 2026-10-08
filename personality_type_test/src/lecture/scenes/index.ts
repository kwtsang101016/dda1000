import type { ComponentType } from "react";
import { NextWeekScene, PreLessonTaskScene } from "./slides";

export interface LectureScene {
  id: string;
  chapter: string;
  label: string;
  Scene: ComponentType;
}

export const SCENES: LectureScene[] = [
  { id: "next-week", chapter: "Joint lecture", label: "Next week!", Scene: NextWeekScene },
  { id: "pre-lesson-task", chapter: "Joint lecture", label: "Pre-lesson task: discover your personality type", Scene: PreLessonTaskScene },
];
