import type { ReactNode } from "react";
import styles from "../Lecture.module.css";
import { usePrintMode } from "../printContext";
import { Callout, Figure, Grid, SceneFrame } from "./shared";

type Accent = "sky" | "lime" | "mint" | "amber" | "coral";

const ACCENT_CLASS: Record<Accent, string> = {
  sky: styles.accentSky,
  lime: styles.accentLime,
  mint: styles.accentMint,
  amber: styles.accentAmber,
  coral: styles.accentCoral,
};

function IconCard({ accent, badge, title, children }: { accent: Accent; badge: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className={`${styles.iconCard} ${ACCENT_CLASS[accent]}`}>
      <div className={styles.iconCardHead}>
        <span className={styles.iconBadge} aria-hidden="true">{badge}</span>
        <span>{title}</span>
      </div>
      {children ? <div className={styles.iconCardBody}>{children}</div> : null}
    </div>
  );
}

function CheckRow({ accent, badge, children }: { accent: Accent; badge: string; children: ReactNode }) {
  return (
    <div className={`${styles.checkRow} ${ACCENT_CLASS[accent]}`}>
      <span className={styles.iconBadge} aria-hidden="true">{badge}</span>
      <span>{children}</span>
    </div>
  );
}

export function QuizScene() {
  return (
    <SceneFrame title="DDA1000 Assessment: Academic Honesty Online Quiz" tone="white">
      <div style={{ textAlign: "center" }}>
        <Figure src="figures/quiz-qr.png" alt="QR code for the Academic Honesty online quiz" width="240px" caption="Scan the QR code" />
        <p className={styles.lead} style={{ margin: "12px auto 0" }}>
          <strong>Start Time:</strong> October. 9(Friday), 3:00PM
        </p>
        <p className={styles.lead} style={{ margin: "8px auto 0" }}>
          <strong>End Time:</strong> October. 16(Friday), 3:00PM
        </p>
      </div>
      <Callout tone="red" icon="!">
        <p>Students must complete the quiz in order to PASS the course.</p>
      </Callout>
    </SceneFrame>
  );
}

export function TitleScene() {
  const print = usePrintMode();
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>DDA1000 · Freshmen Induction and Academic Planning</p>
        <h1 className={styles.coverTitle}>Academic Honesty</h1>
        <p className={styles.subtitle}>Your work. Your sources. Your responsibility.</p>
        <p className={styles.hint}>
          {print ? "DDA1000 · Academic Honesty handout" : "Use ← → or the jump menu · DOWNLOAD PDF for a handout"}
        </p>
      </div>
    </section>
  );
}

export function WhyScene() {
  return (
    <SceneFrame title="Why it matters">
      <Grid cols={3}>
        <IconCard accent="sky" badge="1" title="Fairness">
          <p>Everyone is assessed by the same rules.</p>
        </IconCard>
        <IconCard accent="lime" badge="2" title="Learning">
          <p>Your work shows what you understand.</p>
        </IconCard>
        <IconCard accent="mint" badge="3" title="Trust">
          <p>Honesty protects the value of your degree.</p>
        </IconCard>
      </Grid>
      <Callout tone="red" icon="!">
        <p>CUHK(SZ): zero tolerance for academic dishonesty.</p>
        <p>SDS reviewed 85 cases last year.</p>
      </Callout>
    </SceneFrame>
  );
}

export function RedLinesScene() {
  const items: Array<[Accent, string]> = [
    ["coral", "Plagiarism"],
    ["amber", "Undeclared multiple submission"],
    ["sky", "Third-party work or services"],
    ["lime", "Sharing/copying teaching materials"],
    ["mint", "Exam misconduct or cheating"],
    ["coral", "Impersonation or other dishonest acts"],
  ];
  return (
    <SceneFrame title="Know the red lines">
      <Grid cols={3}>
        {items.map(([accent, title]) => (
          <IconCard key={title} accent={accent} badge="✕" title={title} />
        ))}
      </Grid>
    </SceneFrame>
  );
}

export function PlagiarismScene() {
  return (
    <SceneFrame
      title="Plagiarism is not only copy–paste"
      subtitle="Borrowed wording, ideas, or information may require acknowledgement."
    >
      <div className={styles.split}>
        <Figure src="figures/source-use.jpg" alt="Two documents with quoted passages linked to their sources" caption="SOURCE USE" />
        <div className={styles.stack} style={{ marginTop: 18 }}>
          <CheckRow accent="sky" badge="“">Copied wording, no citation</CheckRow>
          <CheckRow accent="lime" badge="⇄">Paraphrased idea, no citation</CheckRow>
          <CheckRow accent="amber" badge="?">Looked-up fact or data, no citation</CheckRow>
          <Callout tone="blue" icon="✓">
            <p>From a source? Quote it and acknowledge it.</p>
          </Callout>
        </div>
      </div>
    </SceneFrame>
  );
}

export function CitationScene() {
  return (
    <SceneFrame title="The 3-part citation rule">
      <Grid cols={3}>
        <IconCard accent="sky" badge="1" title="QUOTE">
          <p>Mark exact wording.</p>
        </IconCard>
        <IconCard accent="lime" badge="2" title="CITE">
          <p>Point to the source.</p>
        </IconCard>
        <IconCard accent="mint" badge="3" title="REFERENCE">
          <p>Give full source details.</p>
        </IconCard>
      </Grid>
      <Callout tone="red" icon="!">
        <p>A bibliography alone is not enough.</p>
      </Callout>
    </SceneFrame>
  );
}

export function AiHelpScene() {
  return (
    <SceneFrame title="AI, online help, and paid services" subtitle="Support your learning—not replace it.">
      <Grid cols={2}>
        <IconCard accent="mint" badge="✓" title="USE RESPONSIBLY">
          <ul>
            <li>Follow the course policy.</li>
            <li>Disclose or cite when required.</li>
            <li>Keep the reasoning and writing your own.</li>
          </ul>
        </IconCard>
        <IconCard accent="coral" badge="✕" title="NEVER OUTSOURCE">
          <ul>
            <li>Do not buy or commission finished work.</li>
            <li>Do not submit third-party answers as your own.</li>
            <li>Do not share dishonest materials.</li>
          </ul>
        </IconCard>
      </Grid>
      <Callout tone="blue" icon="?">
        <p>Unclear? Ask before submitting.</p>
      </Callout>
    </SceneFrame>
  );
}

export function BeforeExamScene() {
  return (
    <SceneFrame title="Before the exam">
      <div className={styles.stack} style={{ marginTop: 20, maxWidth: 820 }}>
        <CheckRow accent="sky" badge="1">Bring your ID.</CheckRow>
        <CheckRow accent="lime" badge="2">Take the assigned seat.</CheckRow>
        <CheckRow accent="mint" badge="3">Switch off and bag phones/smartwatches before entering.</CheckRow>
        <CheckRow accent="amber" badge="4">Keep only permitted items on the desk.</CheckRow>
        <CheckRow accent="sky" badge="5">Place ID on the desk.</CheckRow>
      </div>
      <Callout tone="red" icon="!">
        <p>More than 30 minutes late = no entry.</p>
      </Callout>
    </SceneFrame>
  );
}

export function DuringExamScene() {
  const items: Array<[Accent, string, string]> = [
    ["sky", "▶", "Wait for permission to start."],
    ["lime", "■", "Stop at “Pens down.”"],
    ["amber", "✕", "No unauthorized materials."],
    ["coral", "✕", "No communication or copying."],
    ["mint", "✕", "No unapproved electronics."],
    ["sky", "✕", "No impersonation."],
  ];
  return (
    <SceneFrame title="During the exam">
      <Grid cols={3}>
        {items.map(([accent, badge, title]) => (
          <IconCard key={title} accent={accent} badge={badge} title={title} />
        ))}
      </Grid>
      <Callout icon="i">
        <p>Remain seated and silent until all materials are collected.</p>
      </Callout>
    </SceneFrame>
  );
}

export function SuspectedCaseScene() {
  const steps: Array<[Accent, string, string]> = [
    ["sky", "REPORT", "Teacher reports"],
    ["lime", "REVIEW", "Committee considers"],
    ["mint", "MEETING", "Student may meet"],
    ["amber", "DECISION", "Student notified"],
    ["coral", "APPEAL", "7 working days"],
  ];
  return (
    <SceneFrame title="If a case is suspected" subtitle="The process is formal, documented, and you can be heard.">
      <ol className={styles.steps}>
        {steps.map(([accent, title, text], index) => (
          <li key={title} className={`${styles.step} ${ACCENT_CLASS[accent]}`}>
            <span className={styles.stepNumber}>{index + 1}</span>
            <span className={styles.stepTitle}>{title}</span>
            <span className={styles.stepText}>{text}</span>
          </li>
        ))}
      </ol>
      <Callout tone="red" icon="!">
        <p>Appeal with full justification. Late appeals are not considered.</p>
      </Callout>
    </SceneFrame>
  );
}

export function ConsequencesScene() {
  return (
    <SceneFrame title="Consequences could be serious">
      <Grid cols={3}>
        <IconCard accent="amber" badge="!" title="PLAGIARISM / MULTIPLE SUBMISSION">
          <p>First offence:</p>
          <ul>
            <li>1 demerit</li>
            <li>zero for the component</li>
            <li>course grade capped at D/Pass</li>
            <li>honesty training</li>
          </ul>
        </IconCard>
        <IconCard accent="coral" badge="!" title="TEST / EXAM CHEATING">
          <p>First offence:</p>
          <ul>
            <li>1 demerit</li>
            <li>failure grade for the course</li>
          </ul>
        </IconCard>
        <IconCard accent="sky" badge="!" title="THIRD-PARTY WORK / IMPERSONATION">
          <p>May include:</p>
          <ul>
            <li>multiple demerits</li>
            <li>failure grade for the course</li>
            <li>suspension</li>
            <li>lower degree classification</li>
          </ul>
        </IconCard>
      </Grid>
      <Callout tone="red" icon="!">
        <p>Last year, more than 20 students received at least 1 demerit.</p>
        <p>Exceptionally serious cases may lead to suspension or termination of studies.</p>
      </Callout>
    </SceneFrame>
  );
}

const OFFICIAL_SOURCES: Array<[Accent, string, string]> = [
  ["lime", "Academic Honesty", "https://registry.cuhk.edu.cn/page/30"],
  [
    "sky",
    "Procedures for Handling Cases of Academic Dishonesty",
    "https://registry.cuhk.edu.cn/sites/default/files/2025-10/CUHK%28SZ%29%20-%20Procedures%20for%20Handling%20Cases%20of%20Academic%20Dishonesty.pdf",
  ],
  ["mint", "University Regulations", "https://registry.cuhk.edu.cn/en/page/18"],
];

export function SourcesScene() {
  return (
    <SceneFrame title="Official sources of policies and regulations">
      <div className={styles.stack} style={{ marginTop: 20 }}>
        {OFFICIAL_SOURCES.map(([accent, label, href]) => (
          <a key={label} className={`${styles.linkCard} ${ACCENT_CLASS[accent]}`} href={href} target="_blank" rel="noreferrer">
            <span>{label}</span>
            <span className={styles.linkArrow} aria-hidden="true">→</span>
          </a>
        ))}
      </div>
      <Callout tone="blue" icon="i">
        <p>Course instructions control permitted collaboration, tools, materials, and citation format.</p>
      </Callout>
    </SceneFrame>
  );
}
