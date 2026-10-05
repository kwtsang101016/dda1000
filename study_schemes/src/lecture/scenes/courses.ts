/** Course tables transcribed from the screenshots in "SDS study schemes.pptx". */

/** Rows sharing a colour are alternatives: students select one of them. */
export type ChoiceColor = "red" | "orange" | "sky" | "green" | "purple";

export interface CourseRow {
  code: string;
  title: string;
  option?: string;
  /** Unit count printed beside the title when it differs from 3. */
  units?: number;
  choice?: ChoiceColor;
}

export interface CourseTableData {
  heading: string;
  rows: CourseRow[];
}

export interface ChoiceLegendGroup {
  title: string;
  pills: Array<{ choice: ChoiceColor; lines: string[] }>;
}

export const SDS_SCHOOL_PACKAGE: CourseTableData = {
  heading: "School Package (DSBDT, CSE, STA)",
  rows: [
    { option: "Option A", code: "CSC1001", title: "Introduction to Computer Science: Programming Methodology", choice: "red" },
    { option: "Option A", code: "CSC1002", title: "Computational Laboratory", choice: "red" },
    { option: "Option B", code: "CSC1003", title: "Introduction to Computer Science and Java Programming", choice: "red" },
    { option: "Option B", code: "CSC1004", title: "Computational Laboratory Using Java", choice: "red" },
    { code: "DDA1000", title: "Freshmen Induction and Academic Planning" },
    { code: "DDA2001", title: "Introduction to Data Science" },
    { code: "MAT1001", title: "Calculus I", choice: "orange" },
    { code: "MAT1002", title: "Calculus II", choice: "sky" },
    { code: "MAT1011", title: "Honours Calculus I", choice: "orange" },
    { code: "MAT1012", title: "Honours Calculus II", choice: "sky" },
    { code: "MAT2041", title: "Linear Algebra and Applications", choice: "green" },
    { code: "MAT2041A", title: "Foundations of Linear Algebra and Applications", choice: "green" },
    { code: "PHY1001", title: "Mechanics" },
    { option: "Option C", code: "STA2001", title: "Probability and Statistics I", choice: "purple" },
    { option: "Option D", code: "STA2001H", title: "Honours Probability and Statistics I", choice: "purple" },
  ],
};

export const SDS_SCHOOL_PACKAGE_LEGEND: ChoiceLegendGroup[] = [
  {
    title: "Select 1 from 2 depending on the destination major",
    pills: [
      { choice: "red", lines: ["CSC1001/CSC1003", "CSC1002/CSC1004"] },
      { choice: "orange", lines: ["MAT1001/MAT1011"] },
      { choice: "sky", lines: ["MAT1002/MAT1012"] },
      { choice: "green", lines: ["MAT2041/MAT2041A"] },
      { choice: "purple", lines: ["STA2001/STA2001H"] },
    ],
  },
];

export const SDS_MAJOR_REQUIRED: CourseTableData[] = [
  {
    heading: "DSBDT (6 courses, 18 units)",
    rows: [
      { code: "CSC3100", title: "Data Structures" },
      { code: "DDA3020", title: "Machine Learning", choice: "orange" },
      { code: "DDA3020H", title: "Honours Machine Learning", choice: "orange" },
      { code: "DDA4002", title: "Stochastic Simulation" },
      { code: "MAT3007", title: "Optimization", choice: "sky" },
      { code: "MAT3007H", title: "Honours Optimization", choice: "sky" },
      { code: "STA2002", title: "Probability and Statistics II", choice: "green" },
      { code: "STA2002H", title: "Honours Probability and Statistics II", choice: "green" },
      { code: "STA4001", title: "Stochastic Processes", choice: "purple" },
      { code: "STA4001H", title: "Honours Stochastic Processes", choice: "purple" },
    ],
  },
  {
    heading: "CSE (6 courses, 20 units)",
    rows: [
      { code: "CSC3001", title: "Discrete Mathematics" },
      { code: "CSC3060", title: "Introduction to Computer Systems", units: 4 },
      { code: "CSC3150", title: "Operating System" },
      { code: "CSC3200", title: "Data Structures and Advanced Programming", units: 4 },
      { code: "CSC4120", title: "Design and Analysis of Algorithms", choice: "red" },
      { code: "CSC4120H", title: "Honours Design and Analysis of Algorithms", choice: "red" },
      { code: "DDA3020", title: "Machine Learning", choice: "orange" },
      { code: "DDA3020H", title: "Honours Machine Learning", choice: "orange" },
    ],
  },
  {
    heading: "STA (6 courses, 18 units)",
    rows: [
      { code: "MAT2050", title: "Mathematical Analysis" },
      { code: "MAT3007", title: "Optimization", choice: "sky" },
      { code: "MAT3007H", title: "Honours Optimization", choice: "sky" },
      { code: "STA2002", title: "Probability and Statistics II", choice: "green" },
      { code: "STA2002H", title: "Honours Probability and Statistics II", choice: "green" },
      { code: "STA3005", title: "Statistical Computing" },
      { code: "STA3020", title: "Statistical Inference" },
      { code: "STA3042", title: "Statistical Learning" },
    ],
  },
];

export const FE_SCHOOL_PACKAGE: CourseTableData = {
  heading: "School Package (FE)",
  rows: [
    { code: "ACT2111", title: "Introductory Financial Accounting" },
    { code: "CSC1001", title: "Introduction to Computer Science: Programming Methodology" },
    { code: "CSC1002", title: "Computational Laboratory" },
    { code: "ECO2011", title: "Introductory Microeconomics" },
    { code: "FIN2010", title: "Financial Management" },
    { code: "MAT1001", title: "Calculus I", choice: "orange" },
    { code: "MAT1011", title: "Honours Calculus I", choice: "orange" },
    { code: "MAT1002", title: "Calculus II", choice: "sky" },
    { code: "MAT1012", title: "Honours Calculus II", choice: "sky" },
    { code: "MAT2040", title: "Linear Algebra", choice: "green" },
    { code: "MAT2041A", title: "Foundations of Linear Algebra and Applications", choice: "green" },
    { code: "MAT2042", title: "Honours Linear Algebra", choice: "green" },
    { code: "STA2001", title: "Probability and Statistics I", choice: "purple" },
    { code: "STA2001H", title: "Honours Probability and Statistics I", choice: "purple" },
  ],
};

export const FE_SCHOOL_PACKAGE_LEGEND: ChoiceLegendGroup[] = [
  {
    title: "Select 1 from 2",
    pills: [
      { choice: "orange", lines: ["MAT1001/MAT1011"] },
      { choice: "sky", lines: ["MAT1002/MAT1012"] },
      { choice: "purple", lines: ["STA2001/STA2001H"] },
    ],
  },
  {
    title: "Select 1 from 3",
    pills: [{ choice: "green", lines: ["MAT2041/MAT2041A/MAT2042"] }],
  },
];

export const FE_MAJOR_REQUIRED: CourseTableData[] = [
  {
    heading: "Quantitative Finance Stream (10 courses, 30 units)",
    rows: [
      { code: "DDA3020", title: "Machine Learning", choice: "orange" },
      { code: "DDA3020H", title: "Honours Machine Learning", choice: "orange" },
      { code: "ECO3121", title: "Introductory Econometrics" },
      { code: "FIN3080", title: "Investment Analysis and Portfolio Management" },
      { code: "FIN3210", title: "Fintech Theory and Practice" },
      { code: "FIN4110", title: "Options and Futures" },
      { code: "FIN4120", title: "Fixed Income Securities Analysis" },
      { code: "FMA4200", title: "Financial Data Analysis" },
      { code: "MAT2002", title: "Ordinary Differential Equations" },
      { code: "MAT3007", title: "Optimization", choice: "sky" },
      { code: "MAT3007H", title: "Honours Optimization", choice: "sky" },
      { code: "STA2002", title: "Probability and Statistics II", choice: "green" },
      { code: "STA2002H", title: "Honours Probability and Statistics II", choice: "green" },
    ],
  },
  {
    heading: "FinTech Stream (8 courses, 24 units)",
    rows: [
      { code: "CSC3100", title: "Data Structures" },
      { code: "ECO3080", title: "Machine Learning for Business" },
      { code: "ECO3121", title: "Introductory Econometrics" },
      { code: "FIN3080", title: "Investment Analysis and Portfolio Management" },
      { code: "FIN3210", title: "Fintech Theory and Practice" },
      { code: "FIN4180", title: "Blockchain Applications in Finance" },
      { code: "MAT3007", title: "Optimization", choice: "sky" },
      { code: "MAT3007H", title: "Honours Optimization", choice: "sky" },
      { code: "STA2002", title: "Probability and Statistics II", choice: "green" },
      { code: "STA2002H", title: "Honours Probability and Statistics II", choice: "green" },
    ],
  },
];
