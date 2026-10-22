import styles from "../Lecture.module.css";
import { Block, BulletList, Callout, DataTable, Figure, Grid, OrderedList, SceneFrame } from "./shared";

const TEST_URL = "https://www.16personalities.com";

export function LectureScene() {
  return (
    <SceneFrame tone="white">
      <div className={styles.split}>
        <div>
          <h1 className={styles.talkTitle}>“Decode, Connect, Adapt: Using Personality Types at University”</h1>
          <p className={styles.talkMeta}>
            <strong>13:30 – 14:30,&nbsp;&nbsp;16 October 2026</strong>
            <br />
            <strong>Liwen Hall 礼文堂</strong>
          </p>
          <p className={styles.speaker}>
            <strong>Dr. Yiu Man Lam</strong>
            <br />
            Centre for Learning Enhancement And Research, CUHK
          </p>
        </div>
        <img
          className={styles.speakerPhoto}
          src={`${import.meta.env.BASE_URL}figures/yiu-man-lam.jpg`}
          alt="Dr. Yiu Man Lam"
        />
      </div>
    </SceneFrame>
  );
}

export function PreLessonTaskScene() {
  return (
    <SceneFrame title="Pre-lesson task: discover your personality type" subtitle="(takes about 10–15 minutes)" tone="white">
      <div className={styles.taskLayout}>
        <div>
          <h2 className={styles.partTitle}>Part 1: Take the test</h2>
          <ol className={styles.orderedList}>
            <li>
              Go to{" "}
              <a href={TEST_URL} target="_blank" rel="noreferrer">
                <strong>www.16personalities.com</strong>
              </a>
              .
            </li>
            <li>
              Click <strong>"Take the test."</strong> You can change the language first if you prefer.
            </li>
            <li>
              <strong>Set your mindset first</strong>. If you can, take the test in a quiet place when you're not rushed or
              stressed. Imagine you're at your most comfortable and natural, like at home with nothing to worry about.
            </li>
            <li>
              Answer all the questions. Go with your first instinct, and answer as you usually are rather than as you'd
              like to be.
            </li>
            <li>
              When you finish, <strong>save or email your results</strong> so you can find them again.
            </li>
          </ol>

          <h2 className={styles.partTitle}>Part 2: Read your result</h2>
          <ol className={styles.orderedList}>
            <li>
              Your result will look like <strong>INFJ-A</strong> or <strong>ENTP-T</strong>. It shows five scales.{" "}
              <strong>We only use the first four letters.</strong> Ignore the last one (A/T).
            </li>
            <li>
              Open the <strong>"Personality Types"</strong> tab in the top menu and select your type.
            </li>
            <li>
              Read the <strong>Introduction</strong>.
            </li>
            <li>
              If you're not sure the description fits, also read <strong>Strengths &amp; Weaknesses</strong>.
            </li>
          </ol>

          <h2 className={styles.partTitle}>Part 3: Reflect</h2>
          <p className={styles.partText}>
            Ask yourself: <em>Does this sound like me?</em>
          </p>
          <ul className={styles.bulletList}>
            <li>You don't have to agree with everything it says.</li>
            <li>You don't have to accept the type yet. We will explore and check your type together in the lesson.</li>
          </ul>
        </div>

        <aside className={styles.taskAside}>
          <Callout tone="blue">
            <p>Bring your four-letter result to the lecture on October 16.</p>
            <p>And, bring with you a pen and a piece of paper.</p>
          </Callout>
          <img
            className={styles.clipart}
            src={`${import.meta.env.BASE_URL}figures/pen-and-paper.jpg`}
            alt="A pen on a sheet of paper"
          />
        </aside>
      </div>
    </SceneFrame>
  );
}

export function LamCoverScene() {
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>Dr Otis Lam @ DDA1000 Freshmen Induction &amp; Academic Planning, CUHK SZ, 2026</p>
        <h1 className={styles.coverTitle}>Decode, Connect, Adapt: Using Personality Types at University</h1>
        <p className={styles.subtitle}>Know Your Type, Own Your Learning</p>
      </div>
    </section>
  );
}

export function OneWordScene() {
  return (
    <SceneFrame title="Activity: ONE word to describe your first month at CUHK(SZ)" tone="white">
      <div className={styles.split}>
        <BulletList
          items={[
            "Anonymous",
            "Scan the QR code to ‘Mentimeter’",
            "Stay on the page, we have other questions",
          ]}
        />
        <Figure src="figures/mentimeter-qr.png" alt="QR code for Mentimeter" width="280px" />
      </div>
    </SceneFrame>
  );
}

export function AboutOtisScene() {
  return (
    <SceneFrame title="About Me — Otis Lam" tone="white">
      <div className={styles.split}>
        <BulletList
          items={["Science (Biology)", "Teaching & Learning", "Personal development", "Professional development"]}
        />
        <Figure src="figures/cuhk-building.jpg" alt="CUHK building" />
      </div>
    </SceneFrame>
  );
}

export function MisunderstandingsScene() {
  return (
    <SceneFrame title="Some Common Misunderstandings of MBTI" tone="white">
      <Figure
        src="figures/misunderstandings.jpg"
        alt="Social-media posts and a personality-test result illustrating common misunderstandings of MBTI"
      />
    </SceneFrame>
  );
}

export function OutcomesScene() {
  return (
    <SceneFrame title="Intended Learning Outcomes" tone="white">
      <p className={styles.lead}>
        Today isn’t about labeling you. It’s about using your preference on purpose.
      </p>
      <p className={styles.partText}>By the end of this lesson, you’re expected to be able to:</p>
      <OrderedList
        items={[
          "Distinguish a preference from an ability.",
          "Recognize the four preference pairs in everyday university life.",
          "Verify your best-fit type instead of just accepting a test result.",
          "Plan one study strategy, including a “stretch”, to test over two weeks.",
        ]}
      />
    </SceneFrame>
  );
}

export function BriefHistoryScene() {
  return (
    <SceneFrame title="Brief History" tone="white">
      <div className={styles.split}>
        <div>
          <Figure src="figures/jung.png" alt="Carl Gustav Jung" width="220px" caption="Carl Gustav Jung (1875–1961) — A Swiss psychologist" />
        </div>
        <BulletList
          items={[
            "Conceptualize human personality and create theories about why we do what we do",
            <>
              <strong>Theory of Psychological Type (1921):</strong> Formulate cognitive functions and
              psychological orientations: e.g. Introversion &amp; Extraversion, Cognitive functions
            </>,
          ]}
        />
      </div>
    </SceneFrame>
  );
}

export function MyersBriggsScene() {
  return (
    <SceneFrame
      title="Myers & Briggs Demonstrated Types"
      subtitle="Mental preferences create measurable patterns across healthy populations"
      tone="white"
    >
      <div className={styles.split}>
        <div>
          <BulletList
            items={[
              <>
                <strong>Katharine C. Briggs</strong> (1875–1968), American
              </>,
              <>
                <strong>Isabel Briggs Myers</strong> (1897–1980), American
              </>,
            ]}
          />
        </div>
        <Callout tone="blue">
          <p>“Differences between people are not random; instead, they form patterns — types.”</p>
        </Callout>
      </div>
    </SceneFrame>
  );
}

export function PrinciplesOneScene() {
  return (
    <SceneFrame title="Key Principles (1/2)" tone="white">
      <p className={styles.lead}>
        <strong>1. Preferences ≠ Abilities</strong>
      </p>
      <p className={styles.partText}>Activity:</p>
      <BulletList
        items={[
          "Write your name on paper with your preferred (natural) hand.",
          "Write your name again with your non-preferred (unnatural) hand.",
          "How does each attempt feel?",
          "e.g. “slow,” “awkward,” “had to concentrate,” or “childlike”",
        ]}
      />
    </SceneFrame>
  );
}

export function PrinciplesTwoScene() {
  return (
    <SceneFrame title="Key Principles (2/2)" tone="white">
      <OrderedList
        items={[
          <>
            <strong>Preferences ≠ Abilities</strong>
          </>,
          <>
            <strong>The theory proposes Type is innate and doesn’t change, but behaviors can adapt.</strong>
          </>,
          <>
            <strong>Descriptive, not prescriptive.</strong>
            <BulletList items={["No excuses", "No stereotyping"]} />
          </>,
          <>
            <strong>You are the FINAL JUDGE of your own type.</strong>
          </>,
        ]}
      />
    </SceneFrame>
  );
}

export function DichotomiesScene() {
  return (
    <SceneFrame title="Dichotomies (二分法)" tone="white">
      <DataTable
        columns={["Pair", "The question", "Not the same as"]}
        rows={[
          ["Extraversion (E) or Introversion (I)", "Where do you get your energy?", "Talkative vs. shy"],
          ["Sensing (S) or Intuition (N)", "How do you take in information?", "Sensitive vs. psychic"],
          ["Thinking (T) or Feeling (F)", "How do you make decisions?", "Smart vs. emotional"],
          ["Judging (J) or Perceiving (P)", "How do you deal with outer world?", "Judgmental vs. perceptive"],
        ]}
      />
    </SceneFrame>
  );
}

export function EnergyScene() {
  return (
    <SceneFrame title="Extraversion (E) vs. Introversion (I)" subtitle="Directing & Receiving Energy" tone="white">
      <BulletList
        items={[
          <>
            <strong>Direct energy:</strong> attention, interest, and engagement
          </>,
          <>
            <strong>Receive energy (Replenishment):</strong> what environments stimulate and restore a
            person versus what leaves them mentally depleted
          </>,
          "≠ Social competence or communication skill",
          <>
            <strong>Extraverts (E)</strong> feel energized and stimulated by interacting with people,
            external events, and active engagement; think-out-loud.
          </>,
          <>
            <strong>Introverts (I)</strong> recharge their energy through quiet contemplation, internal
            dialogue, and solitary reflection; think before speaking.
          </>,
        ]}
      />
    </SceneFrame>
  );
}

export function RechargeScene() {
  return (
    <SceneFrame title="How do you prefer to relax/recharge after having 3 mid-terms in a week?" tone="white">
      <Grid cols={2}>
        <Block title="Extravert (E)">
          <p>
            Head straight to a crowded dining hall, joining a campus event, or talking through the exam
            experience with friends.
          </p>
        </Block>
        <Block title="Introvert (I)" tone="blue">
          <p>
            Return to your dorm room with headphones on, going for a solo walk across campus, or spending
            a quiet evening reading.
          </p>
        </Block>
      </Grid>
    </SceneFrame>
  );
}

export function SensingScene() {
  return (
    <SceneFrame title="Sensing (S) vs. Intuition (N)" subtitle="Taking In Information" tone="white">
      <BulletList
        items={[
          "How individuals take in and perceive information",
          <>
            <strong>Sensing (S):</strong> perceives through the five physical senses, focusing on concrete
            facts, tangible reality, and what is directly present in the moment; focus on immediate
            reality, practical details, and direct, verifiable experience;
          </>,
          <>
            <strong>Intuitive (N):</strong> perceives through indirect unconscious associations, reading
            between the lines to focus on patterns, symbolism, connections, and possibilities; look beyond
            the immediate facts to perceive the “big picture,” reading between the lines to envision
            theoretical connections, innovations, and what could be.
          </>,
        ]}
      />
    </SceneFrame>
  );
}

export function AppleScene() {
  return (
    <SceneFrame title="Look at this image. What are the first 3 things that come to your mind?" tone="white">
      <Figure src="figures/apple.jpg" alt="A bitten red apple" width="300px" />
    </SceneFrame>
  );
}

export function ThinkingFeelingScene() {
  return (
    <SceneFrame title="Thinking (T) vs. Feeling (F)" subtitle="Making Decisions" tone="white">
      <BulletList
        items={[
          "How individuals evaluate information and arrive at decisions.",
          <>
            <strong>Thinking (T):</strong> rely on objective logic and impersonal analysis; step back from
            a situation to evaluate cause-and-effect reasoning, consistency, and objective principles.
          </>,
          <>
            <strong>Feeling (F):</strong> rely on personal values and the human impact of the choice; step
            into a situation to weigh personal and interpersonal values, considering individual needs,
            empathy, and group harmony; a rational evaluating process rather than mere emotional impulse.
          </>,
        ]}
      />
    </SceneFrame>
  );
}

export function GroupProjectScene() {
  return (
    <SceneFrame title="Scenario: First-Year Group Project" tone="white">
      <p className={styles.lead}>
        Your groupmate submits a section of the project that has significant errors and weak arguments.
        What is your natural first reaction?
      </p>
      <Grid cols={2}>
        <Block title="(T)">
          <p>
            Point out the flaws directly and analyze what needs fixing so the project meets grading
            criteria efficiently.
          </p>
        </Block>
        <Block title="(F)" tone="blue">
          <p>
            Consider their feelings first, opening with positive encouragement or framing the critique
            gently to preserve their morale and group harmony.
          </p>
        </Block>
      </Grid>
      <BulletList
        items={[
          "Is it “mean” or “dishonest/weak”?",
          "Truthfulness & Clarity vs Tactfulness & Empathy",
        ]}
      />
    </SceneFrame>
  );
}

export function JudgingScene() {
  return (
    <SceneFrame title="Judging (J) vs. Perceiving (P)" subtitle="Approaching the Outer World" tone="white">
      <BulletList
        items={[
          "How individuals orient their outer lives.",
          <>
            <strong>Judging (J):</strong> prefer a structured, organized approach that seeks closure;
            order, advance planning, and decisive closure so they know what to expect and can manage their
            responsibilities systematically.
          </>,
          <>
            <strong>Perceiving (P):</strong> prefer a spontaneous approach that keeps options;
            adaptability and open-ended exploration, responding to circumstances as they arise and often
            working in spontaneous bursts of energy.
          </>,
        ]}
      />
    </SceneFrame>
  );
}

export function DeadlineScene() {
  return (
    <SceneFrame title="Scenario: Managing Term Paper Deadlines" tone="white">
      <Grid cols={2}>
        <Block title="Judging (J)">
          <p>
            Sets up a study schedule weeks in advance, breaks the paper into daily milestones, and aims to
            submit the assignment well before the deadline to avoid last-minute stress.
          </p>
        </Block>
        <Block title="Perceiving (P)" tone="blue">
          <p>
            Leaves their study schedule flexible, explore widely first, and then work in focused sprints
            before the deadline.
          </p>
        </Block>
      </Grid>
    </SceneFrame>
  );
}

export function TestWebsiteScene() {
  return (
    <SceneFrame title="16Personalities" tone="white">
      <Figure src="figures/16personalities.png" alt="The 16Personalities website: “It’s so incredible to finally be understood.”" />
      <p className={styles.lead} style={{ textAlign: "center" }}>
        <a href={TEST_URL} target="_blank" rel="noreferrer">
          https://www.16personalities.com/
        </a>
      </p>
    </SceneFrame>
  );
}

export function LimitsScene() {
  return (
    <SceneFrame title="Limit of the Instruments" tone="white">
      <BulletList
        items={[
          "Measurement errors: bias, mood, ‘who I should be’",
          "Informal form is less reliable than the official instrument",
          "The official one isn’t 100% accurate or reliable",
          "Triangulation: reported type + self estimate ➤ self-verify",
        ]}
      />
      <div className={styles.typeBoxes}>
        <p>
          Self-estimate: <span aria-hidden="true">☐ ☐ ☐ ☐</span>
        </p>
        <p>
          Reported: <span aria-hidden="true">☐ ☐ ☐ ☐</span>
        </p>
      </div>
    </SceneFrame>
  );
}

export function SelfVerificationScene() {
  return (
    <SceneFrame title="Self-Verification Method" subtitle="Verify Your “Best-Fit Type”" tone="white">
      <OrderedList
        items={[
          "Read your type description and highlight the sentences that fit.",
          "Compare it with the type that differs by one letter on any pair you're unsure about.",
          "Read the opposite type as a contrast.",
          "Ask someone who knows you well.",
        ]}
      />
    </SceneFrame>
  );
}

const TYPE_GRID = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

export function YourTypeScene() {
  return (
    <SceneFrame title="Activity: Your Type, Verified or Not" tone="white">
      <div className={styles.split}>
        <div className={styles.typeGrid} aria-label="The 16 personality types">
          {TYPE_GRID.map((type) => (
            <span key={type}>{type}</span>
          ))}
        </div>
        <BulletList items={["400 people, many patterns.", "Different, not better or worse."]} />
      </div>
    </SceneFrame>
  );
}

export function LearningImplicationScene() {
  return (
    <SceneFrame title="Implication to Your Learning" tone="white">
      <BulletList
        items={[
          "“I am not smart enough for this…”",
          "“My usual approach isn't working for this task yet.”",
          <>
            Your type shows your “default”, not your limit. Sometimes a task asks for a different way of
            thinking than your default. e.g. the lecture starts with abstract theory, but you make sense of
            things through concrete examples first.
          </>,
          "➤ Adjust your strategy !",
          "Feeling stretched is normal. It means you're working outside your comfort zone, not that you lack ability.",
        ]}
      />
    </SceneFrame>
  );
}

export function MakePlanScene() {
  return (
    <SceneFrame title="Activity: Make a Plan to Try" tone="white">
      <BulletList
        items={[
          <>
            Think of a strategy as a hypothesis. Try it for two weeks, look at the results (grades, stress,
            time spent), then keep it or change it.
          </>,
          "“When _____ happen, I will try ______ this week.”",
        ]}
      />
    </SceneFrame>
  );
}

export function StudyStrategiesScene() {
  return (
    <SceneFrame title="Study strategies: use your preference, then stretch" subtitle="U = Use · S = Stretch" tone="white">
      <DataTable
        columns={["", "Use (U)", "Stretch (S)"]}
        rows={[
          ["E", "Study groups, explaining ideas out loud, office hours", "Do some practice alone, because exams are taken alone"],
          ["I", "Preview material before tutorials, write your questions down", "Plan to say one thing in each tutorial"],
          ["S", "Worked examples, practice problems, real datasets", "Ask “Why does this work?” and draw a concept map"],
          ["N", "Start with the big picture and link ideas together", "Show every step and reread the question for details"],
          ["T", "Use rubrics, criteria and logical outlines", "In feedback, say what's good before giving criticism"],
          ["F", "Connect topics to people and values, study with supportive peers", "Treat feedback on your work as separate from feedback on you"],
          ["J", "Schedules, early starts, checklists", "Build in buffer time and stay open to changing the plan"],
          ["P", "Short bursts of work, variety, several small deadlines", "Set your own earlier deadline, or just start with 15 minutes"],
        ]}
      />
    </SceneFrame>
  );
}

export function LamSummaryScene() {
  return (
    <SceneFrame title="Summary" tone="white">
      <OrderedList
        items={[
          "Preferences ≠ Abilities. They show what comes naturally, not what you’re capable of.",
          "You decide your own type. Check it instead of just accepting it.",
          "Use your preferences on purpose, and stretch when the situation calls for it.",
          "Growth is possible. Remember, you have ‘two hands’.",
        ]}
      />
    </SceneFrame>
  );
}

export function SixteenTypesScene() {
  return (
    <SceneFrame title="16 Personality Types — One Big House" tone="white">
      <Figure src="figures/16-types-house.jpg" alt="A house whose rooms represent the 16 personality types" />
    </SceneFrame>
  );
}

export function FurtherReferenceScene() {
  return (
    <SceneFrame title="Further Reference" tone="white">
      <div className={styles.split}>
        <BulletList
          items={[
            <>
              <strong>Gifts Differing</strong> — Understanding Personality Type, by Isabel Briggs Myers
              with Peter B. Myers
            </>,
            "Official MBTI website",
          ]}
        />
        <Figure src="figures/gifts-differing.png" alt="Cover of Gifts Differing: Understanding Personality Type" width="240px" />
      </div>
    </SceneFrame>
  );
}

