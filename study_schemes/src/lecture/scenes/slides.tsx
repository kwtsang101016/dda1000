import styles from "../Lecture.module.css";
import { usePrintMode } from "../printContext";
import { BulletList, Figure, Notes, SceneFrame } from "./shared";
import {
  FE_MAJOR_REQUIRED,
  FE_SCHOOL_PACKAGE,
  FE_SCHOOL_PACKAGE_LEGEND,
  SDS_MAJOR_REQUIRED,
  SDS_SCHOOL_PACKAGE,
  SDS_SCHOOL_PACKAGE_LEGEND,
  type ChoiceColor,
  type ChoiceLegendGroup,
  type CourseTableData,
} from "./courses";

const CHOICE_CLASS: Record<ChoiceColor, string> = {
  red: styles.choice_red,
  orange: styles.choice_orange,
  sky: styles.choice_sky,
  green: styles.choice_green,
  purple: styles.choice_purple,
};

function figureUrl(name: string): string {
  return `${import.meta.env.BASE_URL}figures/${name}`;
}

function CourseTable({ table, showHeading = true }: { table: CourseTableData; showHeading?: boolean }) {
  const hasOptions = table.rows.some((row) => row.option);
  return (
    <div>
      {showHeading ? <p className={styles.courseTitle}>{table.heading}</p> : null}
      <div className={`${styles.tableWrap} ${styles.courseTable}`} style={{ marginTop: 0 }}>
        <table>
          <thead>
            <tr>
              <th colSpan={hasOptions ? 2 : 1}>Course Code</th>
              <th>Course Title (English)</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => {
              const previous = table.rows[index - 1];
              const startsOption = row.option && row.option !== previous?.option;
              const optionSpan = startsOption
                ? table.rows.slice(index).findIndex((next) => next.option !== row.option)
                : 0;
              return (
                <tr key={`${row.code}-${index}`} className={row.choice ? CHOICE_CLASS[row.choice] : undefined}>
                  {hasOptions && startsOption ? (
                    <td className={styles.option} rowSpan={optionSpan < 0 ? table.rows.length - index : optionSpan}>
                      {row.option}
                    </td>
                  ) : null}
                  <td className={styles.code} colSpan={hasOptions && !row.option ? 2 : 1}>
                    {row.code}
                  </td>
                  <td>
                    {row.title}
                    {row.units ? <span className={styles.unitTag}> ({row.units})</span> : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChoiceLegend({ groups }: { groups: ChoiceLegendGroup[] }) {
  return (
    <div className={styles.choiceLegend}>
      {groups.map((group) => (
        <div key={group.title} className={styles.choiceLegend}>
          <p className={styles.choiceLegendTitle}>{group.title}</p>
          {group.pills.map((pill) => (
            <div key={pill.lines.join("/")} className={`${styles.choicePill} ${CHOICE_CLASS[pill.choice]}`}>
              {pill.lines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function RequirementTree({
  root,
  branches,
}: {
  root: string[];
  branches: Array<{ title: string; units: string; note: string }>;
}) {
  return (
    <div className={styles.tree}>
      <div className={styles.treeRoot}>
        <img className={styles.unitPhoto} src={figureUrl("sds-sign.jpg")} alt="School of Data Science sign" />
        <div className={styles.treeRootBox}>
          {root.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
      <div className={styles.treeConnector} aria-hidden="true" />
      <div className={styles.treeBranches}>
        {branches.map((branch) => (
          <div key={branch.title} className={styles.treeBranch}>
            <div className={styles.treeBranchBox}>
              {branch.title}
              <small>{branch.units}</small>
            </div>
            <p className={styles.treeBranchNote}>{branch.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoverScene() {
  const print = usePrintMode();
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>DDA1000 · Freshmen Induction and Academic Planning</p>
        <h1 className={styles.coverTitle}>SDS Study Schemes</h1>
        <p className={styles.hint}>
          {print ? "DDA1000 · SDS Study Schemes handout" : "Use ← → or the jump menu · DOWNLOAD PDF for a handout"}
        </p>
      </div>
    </section>
  );
}

export function RegistryScene() {
  return (
    <SceneFrame title="Important documents at the website of Registry Office 大学教务处网页">
      <p className={styles.lead}>
        <a href="https://registry.cuhk.edu.cn/en/page/19" target="_blank" rel="noreferrer">
          https://registry.cuhk.edu.cn/en/page/19
        </a>
      </p>
      <Figure
        src="figures/registry-curriculum.jpg"
        alt="Registry Office web page: Academic Curriculum of the Undergraduate Programmes"
        width="760px"
      />
      <Notes
        paragraphs={[
          "The website of university Registry Office has the complete and most up-dated versions of all official documents.",
          "These documents may be a little long and complicated, as they are meant to be comprehensive and complete. Nevertheless, students are suggested to go through them and make reference to them, especially when there is any confusion and ambiguity.",
          "The presentation slides we use in the course are a kind of summary and highlights. They are easier to visualize and understand, but the information may not be complete.",
        ]}
      />
    </SceneFrame>
  );
}

export function CurriculumTextScene() {
  return (
    <SceneFrame>
      <p className={styles.lead}>
        The undergraduate curriculum is built upon a <span className={styles.emph}>credit unit system</span>,
        with flexibility and choices both in the selection of courses and in the sequence and pace of
        electives. Students may, based on individual circumstances and interest, tailor the progress of their
        studies.{" "}
        <span className={styles.emph}>
          Those who have completed the required number of course units, and satisfy the graduation
          requirements of the major programme and of the University, will be considered for the award of a
          Bachelor's degree
        </span>
        .
      </p>
      <p className={styles.lead}>
        The University's Bachelor's degrees are classified as: First Class Honours, Second Class Honours
        Upper Division, Second Class Honours Lower Division, Third Class Honours, and Pass. Degree
        classification is based on the students' grade point averages for Major courses and for all other
        courses.
      </p>
      <p className={styles.lead}>
        <span className={styles.emph}>
          The normative period of study is four years and students have to complete 120 units and satisfy
          requirements under separate categories
        </span>
        .
      </p>
      <Notes
        paragraphs={[
          "Students can graduate and get the degree after satisfying the graduation requirements.",
          "Graduation requirements are composed of several parts. Students need to satisfy each part as well as the whole.",
          "The requirements are basic and the “minimum”. Students can exceed it, as their own wish.",
        ]}
      />
    </SceneFrame>
  );
}

export function UnitsScene() {
  const rows: Array<[string, string, string, string]> = [
    ["university-core.jpg", "CUHK-Shenzhen crest", "University core", "(36 units)"],
    ["sds-sign.jpg", "School of Data Science sign", "Major requirement", "(70-71 units)"],
    ["free-electives.jpg", "University library", "Free electives", "(13-14 units)"],
  ];
  return (
    <SceneFrame>
      <div className={styles.unitStack}>
        {rows.map(([image, alt, label, units]) => (
          <div key={label} className={styles.unitRow}>
            <img className={styles.unitPhoto} src={figureUrl(image)} alt={alt} />
            <div className={styles.unitBar}>
              {label}
              <br />
              {units}
            </div>
          </div>
        ))}
      </div>
      <p className={styles.unitTotal}>Total: 120 units</p>
      <Notes
        paragraphs={[
          "The complete university graduation requirement is 120 units. Again, this is the lower bound. Students can take more units than this.",
          "The 120 units comprise 3 parts.",
          "University core: languages (Chinese, English), general education, physical education, and digital literacy. The total requirement is 36 units. We will not discuss it Just bear in mind. You must complete this part to graduate.",
          "Major requirement is what you need to work for and plan well toward your major, whether it is CS, DS, STA or FE. At SDS, the major requirement is 70 or 71 units.",
          "University core and major requirement add up to 106 or 107 units. In order to reach 120 units, students need to fill up the 13-14 units gap.",
        ]}
      />
    </SceneFrame>
  );
}

export function KeyPointsScene() {
  return (
    <SceneFrame title="Key Points">
      <BulletList
        items={[
          <>
            “Requirement” mean <strong>MINIMUM</strong> no. of units a student must take in order to get the
            degree. Students can take more than required.
          </>,
          <>
            Major requirement varies one major from other. In SDS, for 2026 intake
            <div className={styles.tableWrap} style={{ maxWidth: 320, boxShadow: "none" }}>
              <table>
                <tbody>
                  {[
                    ["DSBDT:", "71 units"],
                    ["CSE:", "70 units"],
                    ["STA:", "71 units"],
                    ["FE:", "70 units"],
                  ].map(([major, units]) => (
                    <tr key={major}>
                      <td className={styles.rowHead}>{major}</td>
                      <td>{units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>,
          "Free electives are indeed “FREE”. Students can take additional major related units, or any courses of interest, as long as the overall total is 120 or above.",
        ]}
      />
      <Notes
        paragraphs={[
          "Again, 70-71 units for major is the minimum.",
          "The free electives are really FREE. You are allowed to use all of them to take major related courses, or you can take foreign languages, social science, culture, politics, music, medicine, …  As long as your major part is 70-71 or above, and the total is 120 or above, you can graduate.",
        ]}
      />
    </SceneFrame>
  );
}

export function SdsStructureScene() {
  return (
    <SceneFrame title="DSBDT, CSE, STA">
      <RequirementTree
        root={["Major requirement", "(70-71 units)"]}
        branches={[
          { title: "School package", units: "(23 units)", note: "All SDS students have to complete" },
          { title: "Major required", units: "(18-20 units)", note: "Required for all students in the respective major" },
          { title: "Major electives", units: "(27-30 units)", note: "Can be selected by all students in the respective major" },
        ]}
      />
      <Notes
        paragraphs={[
          "Now let us dig into the major requirement. We talk about the three majors which the SDS students will choose after year 1.",
          "Courses in the school package amount 23 units. They are common to all SDS students.",
          "Major required (MR) courses differ from one major to anther. All students in the same major will have to take this part.",
          "Major electives (ME) courses are a large and diverse course pool in which students of the respective major can select.",
        ]}
      />
    </SceneFrame>
  );
}

export function SdsSchoolPackageScene() {
  return (
    <SceneFrame title={SDS_SCHOOL_PACKAGE.heading}>
      <div className={styles.split} style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <CourseTable table={SDS_SCHOOL_PACKAGE} showHeading={false} />
        <ChoiceLegend groups={SDS_SCHOOL_PACKAGE_LEGEND} />
      </div>
      <Notes
        paragraphs={[
          "This is the school package. The courses include programming, maths, statistics, and data science basics.",
          "For programming, the bundle CSC1003/CSC1004 are recommended for students who aim at CSE major. They are about JAVA programming. CSC1001/CSC1002 are Python programming.",
          "The other choices in maths and statistics courses are mainly about the level of difficulty. Students can choose according to their interest and strength.",
        ]}
      />
    </SceneFrame>
  );
}

export function SdsMajorRequiredScene() {
  return (
    <SceneFrame title="Major Required (DSBDT, CSE, STA)">
      <div className={styles.grid} style={{ ["--cols" as string]: "3" }}>
        {SDS_MAJOR_REQUIRED.map((table) => (
          <CourseTable key={table.heading} table={table} />
        ))}
      </div>
      <Notes
        paragraphs={[
          "18 units or 6 courses of major required courses for DS and STA students",
          "20 units (2 courses are 4 unit) for CSE.",
          "There are many common required courses across majors.",
        ]}
      />
    </SceneFrame>
  );
}

export function FeStructureScene() {
  return (
    <SceneFrame title="Financial Engineering (FE)">
      <RequirementTree
        root={["Major requirement", "(70 units)"]}
        branches={[
          { title: "School package", units: "(25 units)", note: "Required for all students in FE" },
          { title: "Major required", units: "(30 units)", note: "Required for all students in FE" },
          { title: "Major electives", units: "(15 units)", note: "Can be selected by all students in FE" },
        ]}
      />
      <Notes
        paragraphs={[
          "This is the major curriculum for FE.",
          "The key difference compared to other  SDS majors is that the proportion of compulsory courses is large, i.e., 55 units out of 70.",
        ]}
      />
    </SceneFrame>
  );
}

export function FeSchoolPackageScene() {
  return (
    <SceneFrame title={FE_SCHOOL_PACKAGE.heading}>
      <div className={styles.split} style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <CourseTable table={FE_SCHOOL_PACKAGE} showHeading={false} />
        <ChoiceLegend groups={FE_SCHOOL_PACKAGE_LEGEND} />
      </div>
      <Notes
        paragraphs={[
          "For FE, the school package contains one economics, one finance, and one accounting course. The others are similar to SDS majors.",
        ]}
      />
    </SceneFrame>
  );
}

export function FeMajorRequiredScene() {
  return (
    <SceneFrame title="Major Required (FE)">
      <div className={styles.grid}>
        {FE_MAJOR_REQUIRED.map((table) => (
          <CourseTable key={table.heading} table={table} />
        ))}
      </div>
      <Notes paragraphs={["The major required courses for FE include multiple finance courses."]} />
    </SceneFrame>
  );
}

export function CompareRequiredScene() {
  return (
    <SceneFrame title="Comparison among Majors" subtitle="Major Required courses">
      <p className={styles.courseTitle} style={{ marginTop: 20, textDecoration: "underline" }}>
        School Package
      </p>
      <BulletList
        items={[
          "all programmes (CSE, DSBDT, STA, FE) have “Basic Programming”, “Calculus”, “Linear Algebra”, and “Probability & Statistics”",
          "Some have different versions: CSC1001 vs 1003, MAT2040 vs 2041",
        ]}
      />
      <p className={styles.courseTitle} style={{ marginTop: 20, textDecoration: "underline" }}>
        Major Required
      </p>
      <BulletList
        items={[
          "MAT3007 Optimization and STA2002 Prob and Stat II for DSBDT, STA and FE",
          "DDA3020 Machine Learning for CSE, DSBDT and QFin stream of FE",
          "CSC3100/3200 Data Structures for CSE, DSBDT and FinTech stream of FE",
          <>
            A required course in one major is often listed as major elective in another:
            <div className={styles.tableWrap} style={{ maxWidth: 620, boxShadow: "none" }}>
              <table>
                <tbody>
                  {[
                    ["MAT2050:", "required in STA → elective in DSBDT and FE"],
                    ["CSC3001:", "required in CSE → elective in DSBDT, STA and FE"],
                    ["DDA4002:", "required in DSDBT → elective in CSE, STA"],
                    ["ECO3121:", "required in FE → elective in CSE, DSBDT and STA"],
                  ].map(([code, text]) => (
                    <tr key={code}>
                      <td className={styles.rowHead}>{code}</td>
                      <td>{text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>,
        ]}
      />
      <Notes
        paragraphs={[
          "This is a summary of comparison among the majors.",
          "On the foundation and requires courses , about 50-60% are the same, especially Year 1 and 2. Many elective courses are also popular for all majors.",
        ]}
      />
    </SceneFrame>
  );
}

export function CompareElectivesScene() {
  const majors: Array<[string, string]> = [
    ["DSBDT", "5 streams of specialization: “Methodology & Theory”, “Finance & Economics”, “Operations Management”, “Life Science”, “Computing”"],
    ["CSE", "one optional stream \"Artificial Intelligence”"],
    ["STA", "5 streams of specialization: “Mathematical Statistics”, “Statistical Methodology”, “Biostatistics & Bioinformatics”, “Financial Statistics”, “Computing & Machine Learning”"],
    ["FE", "2 streams of specialization: “Quantitative Finance”, “FinTech”"],
  ];
  return (
    <SceneFrame title="Comparison among Majors" subtitle="Major Elective courses">
      {majors.map(([major, text]) => (
        <div key={major}>
          <p className={styles.courseTitle} style={{ marginTop: 20, textDecoration: "underline" }}>
            {major}
          </p>
          <BulletList items={[text]} />
        </div>
      ))}
    </SceneFrame>
  );
}

export function StreamsScene() {
  return (
    <SceneFrame title="Streams of specialization">
      <BulletList
        items={[
          "Each specialization stream has a set of designated elective courses for students to take.",
          "One function of such arrangement is to provide guidance for students in course selection.",
          "Students can declare the specialization at their expected graduation term. No need to apply beforehand.",
          "Students may decide not to declare any stream.",
        ]}
      />
    </SceneFrame>
  );
}
