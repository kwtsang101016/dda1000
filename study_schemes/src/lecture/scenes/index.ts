import type { ComponentType } from "react";
import {
  CompareElectivesScene,
  CompareRequiredScene,
  CoverScene,
  CurriculumTextScene,
  FeMajorRequiredScene,
  FeSchoolPackageScene,
  FeStructureScene,
  KeyPointsScene,
  RegistryScene,
  SdsMajorRequiredScene,
  SdsSchoolPackageScene,
  SdsStructureScene,
  StreamsScene,
  UnitsScene,
} from "./slides";

export interface LectureScene {
  id: string;
  chapter: string;
  label: string;
  Scene: ComponentType;
}

const UNIVERSITY = "University requirements";
const SDS = "DSBDT, CSE, STA";
const FE = "Financial Engineering";
const COMPARE = "Comparison";

export const SCENES: LectureScene[] = [
  { id: "cover", chapter: "Cover", label: "SDS Study Schemes", Scene: CoverScene },
  { id: "registry", chapter: UNIVERSITY, label: "Important documents at the Registry Office website", Scene: RegistryScene },
  { id: "curriculum", chapter: UNIVERSITY, label: "Academic curriculum", Scene: CurriculumTextScene },
  { id: "units", chapter: UNIVERSITY, label: "Total: 120 units", Scene: UnitsScene },
  { id: "key-points", chapter: UNIVERSITY, label: "Key Points", Scene: KeyPointsScene },
  { id: "sds-structure", chapter: SDS, label: "Major requirement (70-71 units)", Scene: SdsStructureScene },
  { id: "sds-school-package", chapter: SDS, label: "School Package (DSBDT, CSE, STA)", Scene: SdsSchoolPackageScene },
  { id: "sds-major-required", chapter: SDS, label: "Major Required (DSBDT, CSE, STA)", Scene: SdsMajorRequiredScene },
  { id: "fe-structure", chapter: FE, label: "Financial Engineering (FE)", Scene: FeStructureScene },
  { id: "fe-school-package", chapter: FE, label: "School Package (FE)", Scene: FeSchoolPackageScene },
  { id: "fe-major-required", chapter: FE, label: "Major Required (FE)", Scene: FeMajorRequiredScene },
  { id: "compare-required", chapter: COMPARE, label: "Major Required courses", Scene: CompareRequiredScene },
  { id: "compare-electives", chapter: COMPARE, label: "Major Elective courses", Scene: CompareElectivesScene },
  { id: "streams", chapter: COMPARE, label: "Streams of specialization", Scene: StreamsScene },
];
