import styles from "../Lecture.module.css";
import { usePrintMode } from "../printContext";
import { Block, BulletList, Callout, Grid, OrderedList, SceneFrame } from "./shared";

const COVER_HINT_LIVE = "Use ← → or the jump menu · DOWNLOAD PDF for a handout";
const COVER_HINT_PRINT = "DDA1000 · Studying at SDS: How";

export function CoverScene() {
  const print = usePrintMode();
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>DDA1000 Freshmen Induction and Academic Planning</p>
        <h1 className={styles.coverTitle}>Studying at SDS: How?</h1>
        <p className={styles.subtitle}>Learning Methods &amp; Opportunities</p>
        <p className={styles.lead}>
          Build a university life that helps you adapt, learn, explore, and grow.
        </p>
        <p className={styles.hint}>{print ? COVER_HINT_PRINT : COVER_HINT_LIVE}</p>
      </div>
    </section>
  );
}

export function RouteScene() {
  return (
    <SceneFrame kicker="Today's route" title="Four parts, one purpose">
      <OrderedList
        items={[
          <>
            <strong>Adapting to University Life:</strong> Build a structure that works for you
          </>,
          <>
            <strong>Academic Learning:</strong> Study actively and sustainably
          </>,
          <>
            <strong>Extracurricular Development:</strong> Use opportunities to test your interests and
            know yourself
          </>,
          <>
            <strong>Further Growth and Broader Development:</strong> Develop capabilities beyond
            course knowledge
          </>,
        ]}
      />
      <p className={styles.lead}>
        University changes what you know, how you learn, and who you become.
      </p>
      <Callout tone="red">
        <p>The goal is not simply higher grades. It is learning to direct your own development.</p>
      </Callout>
    </SceneFrame>
  );
}

export function AdaptSectionScene() {
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>01</p>
        <h1 className={styles.coverTitle}>Adapting to University Life</h1>
        <p className={styles.lead}>Your first task is to build a structure that works for you.</p>
      </div>
    </section>
  );
}

export function WhichSentenceScene() {
  return (
    <SceneFrame kicker="01 Adapt" title="Which sentence sounds most like you?">
      <Grid cols={2}>
        <Block title="A">
          <p>&ldquo;I finally have freedom. I will figure things out later.&rdquo;</p>
        </Block>
        <Block title="B" tone="blue">
          <p>&ldquo;Everyone seems ahead of me. I need to catch up now.&rdquo;</p>
        </Block>
        <Block title="C" tone="red">
          <p>&ldquo;I have many goals, but I do not know what to prioritize.&rdquo;</p>
        </Block>
        <Block title="D">
          <p>&ldquo;I want to make progress, but I do not know where to start.&rdquo;</p>
        </Block>
      </Grid>
      <Callout>
        <p>Different starting points, same task: learn to manage your own learning.</p>
      </Callout>
    </SceneFrame>
  );
}

export function WhatChangesScene() {
  return (
    <SceneFrame kicker="01 Adapt" title="What changes, and why it feels hard">
      <Grid cols={2}>
        <Block title="What changes">
          <BulletList
            items={[
              "High school gave you structure; now you build it",
              "A clear daily schedule becomes more choice and ambiguity",
              "Frequent reminders give way to feedback that arrives later",
              "One dominant goal becomes several competing goals",
            ]}
          />
        </Block>
        <Block title="How it can feel" tone="blue">
          <BulletList
            items={[
              "Freedom can feel relaxing, or overwhelming",
              "Comparison creates unnecessary pressure",
              "Feedback may come too late to correct course",
              "Too many goals make priorities unclear",
              "Perfectionism makes setbacks feel personal",
            ]}
          />
        </Block>
      </Grid>
      <Callout tone="red">
        <p>These are adjustment difficulties, not proof that you do not belong.</p>
      </Callout>
    </SceneFrame>
  );
}

export function RhythmScene() {
  return (
    <SceneFrame kicker="01 Adapt" title="Your first semester: build a rhythm and use your support">
      <Grid cols={2}>
        <Block title="Build a rhythm">
          <BulletList
            items={[
              "Start your routine in week one",
              "Attend lectures and tutorials",
              "Complete work on time",
              "Review difficult material every week",
              "Protect sleep and recovery",
            ]}
          />
        </Block>
        <Block title="Ask early" tone="blue">
          <BulletList
            items={[
              <>
                <strong>Course:</strong> Instructor, teaching assistant, office hours, tutorials
              </>,
              <>
                <strong>Planning:</strong> First-year advisor, academic advisor, peer advisor, SDS
                Undergraduate Office
              </>,
              <>
                <strong>Well-being:</strong> Counseling services, trusted adults, friends, classmates,
                college community
              </>,
            ]}
          />
        </Block>
      </Grid>
      <Callout>
        <p>
          Consistency matters more than intensity. Asking for help is how independent learners use
          resources.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function EnglishScene() {
  return (
    <SceneFrame kicker="01 Adapt" title="Adapt to learning in English, one step at a time">
      <OrderedList
        items={[
          <>
            <strong>Preview key language:</strong> Read the outline and key terms before class.
          </>,
          <>
            <strong>Follow ideas, not every word:</strong> Listen for the structure, examples, and
            conclusions.
          </>,
          <>
            <strong>Review while it is fresh:</strong> Revisit your notes and explain the main ideas
            in your own words.
          </>,
          <>
            <strong>Ask, speak, and use support:</strong> Use office hours, TAs, and classmates;
            practice even when your English is not perfect.
          </>,
        ]}
      />
      <Callout tone="blue">
        <p>English is part of the learning process, not a test you must pass before you begin.</p>
      </Callout>
    </SceneFrame>
  );
}

export function LearnSectionScene() {
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>02</p>
        <h1 className={styles.coverTitle}>Academic Learning</h1>
        <p className={styles.lead}>Study actively, sustainably, and honestly.</p>
      </div>
    </section>
  );
}

export function ChooseCoursesScene() {
  return (
    <SceneFrame kicker="02 Learn" title="Choose courses with a purpose">
      <OrderedList
        items={[
          <>
            <strong>Requirement:</strong> How does it fit the Study Scheme?
          </>,
          <>
            <strong>Readiness:</strong> Do I have the prerequisites and time?
          </>,
          <>
            <strong>Direction:</strong> What skill, field, or question will it help me explore?
          </>,
          <>
            <strong>Balance:</strong> Does the full semester remain sustainable?
          </>,
        ]}
      />
      <p className={styles.lead}>
        Ask your AA/DAA, upper-class students, and classmates for reviews, but remember everyone's
        needs differ.
      </p>
      <Callout>
        <p>
          A good course plan balances what you need, what you are ready for, and what you want to
          explore.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function SyllabusScene() {
  return (
    <SceneFrame kicker="02 Learn" title="The course outline/syllabus is your first planning tool">
      <p className={styles.lead}>Read it before you need it. It answers:</p>
      <BulletList
        items={[
          "What should I be able to do?",
          "How will my work be assessed?",
          "When are the key deadlines?",
          "What are the attendance and late-work rules?",
          "How can I contact the teaching team?",
        ]}
      />
      <Callout tone="red">
        <p>
          A course outline/syllabus tells you what the course expects, and when small choices will
          become consequences.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function WeeklyRhythmScene() {
  return (
    <SceneFrame kicker="02 Learn" title="Each week: study actively, in a sustainable way">
      <Grid cols={2}>
        <Block title="Your weekly rhythm">
          <BulletList
            items={[
              <>
                <strong>Before class:</strong> Preview the topic; identify questions
              </>,
              <>
                <strong>During class:</strong> Listen actively; mark what is unclear
              </>,
              <>
                <strong>After class:</strong> Practice from memory; check mistakes
              </>,
              <>
                <strong>Ask:</strong> Bring what is still unclear to office hours or tutorials
              </>,
              <>
                <strong>Weekly:</strong> Review progress; reset priorities
              </>,
            ]}
          />
        </Block>
        <Block title="What active practice looks like" tone="blue">
          <p>
            <strong>Math &amp; statistics</strong>
          </p>
          <BulletList
            items={[
              "Re-derive important steps without notes",
              "Solve varied problems, not one repeated pattern",
              "Separate conceptual and calculation errors",
            ]}
          />
          <p style={{ marginTop: 12 }}>
            <strong>Programming</strong>
          </p>
          <BulletList
            items={[
              "Write code from a blank file",
              "Predict output before running the code",
              "Explain the cause of an error and its correction",
            ]}
          />
        </Block>
      </Grid>
      <Callout tone="red">
        <p>
          If you cannot reproduce it, explain it, or adapt it, you probably do not own it yet.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function AiPartnerScene() {
  return (
    <SceneFrame kicker="02 Learn" title="Use AI as a learning partner, not a substitute">
      <Grid cols={2}>
        <Block title="Use AI to">
          <BulletList
            items={[
              "Clarify difficult concepts",
              "Generate practice questions",
              "Compare explanations",
              "Improve writing clarity",
            ]}
          />
        </Block>
        <Block title="Do not use AI to" tone="red">
          <BulletList
            items={[
              "Replace your own reasoning",
              "Submit work you cannot explain",
              "Trust answers without checking",
              "Ignore course-specific rules",
            ]}
          />
        </Block>
      </Grid>
      <p className={styles.lead}>
        Verify with course notes, textbooks, executable code, or the teaching team.
      </p>
      <Callout tone="blue">
        <p>
          Evaluating whether an AI answer is correct is itself an exercise in critical thinking.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function ExploreSectionScene() {
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>03</p>
        <h1 className={styles.coverTitle}>Extracurricular Development</h1>
        <p className={styles.lead}>
          Use opportunities to test your interests, not to collect labels.
        </p>
      </div>
    </section>
  );
}

export function WhatExploreScene() {
  return (
    <SceneFrame kicker="03 Explore" title="What can you explore, and how much at once?">
      <Grid cols={2}>
        <Block title="Options beyond the classroom">
          <BulletList
            items={[
              <>
                <strong>Research:</strong> Do I enjoy creating knowledge?
              </>,
              <>
                <strong>Internship:</strong> What kind of work suits me?
              </>,
              <>
                <strong>Exchange:</strong> How do I learn in a new environment?
              </>,
              <>
                <strong>Competitions &amp; projects:</strong> Do I enjoy solving problems and building
                with others?
              </>,
              <>
                <strong>Clubs &amp; service:</strong> What can I contribute to a community?
              </>,
            ]}
          />
        </Block>
        <Block title="Keep it manageable" tone="blue">
          <OrderedList
            items={[
              <>
                <strong>Foundation first:</strong> Core courses, key skills
              </>,
              <>
                <strong>One main exploration:</strong> Choose one direction at a time
              </>,
              <>
                <strong>One small experiment:</strong> Low-cost, easy to stop
              </>,
            ]}
          />
        </Block>
      </Grid>
      <Callout tone="red">
        <p>Do not collect activities. Use each experience to learn more about yourself.</p>
      </Callout>
    </SceneFrame>
  );
}

export function EachYearScene() {
  return (
    <SceneFrame kicker="03 Explore" title="Each year can have different tasks">
      <Grid cols={2}>
        <Block title="Year 1, explore">
          <p>Learning habits, friends, academic foundations</p>
        </Block>
        <Block title="Year 2, try" tone="blue">
          <p>Core skills, small projects, a first try at a research or an internship</p>
        </Block>
        <Block title="Year 3, apply" tone="red">
          <p>One or two paths (research, internship, or exchange)</p>
        </Block>
        <Block title="Year 4, deliver">
          <p>Capstone, graduate study/job applications</p>
        </Block>
      </Grid>
      <p className={styles.lead}>
        Summers can be used for courses, research, internships, exchange, or rest. Choose by purpose.
      </p>
      <Callout>
        <p>
          Your path does not need to be perfectly linear. The purpose of each stage is to become more
          informed.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function ResearchScene() {
  return (
    <SceneFrame kicker="03 Explore" title="Research begins with readiness, not a title">
      <Grid cols={2}>
        <Block title="Ask yourself first">
          <BulletList
            items={[
              <>
                <strong>What do I want to do?</strong> Which topic, problem, or method genuinely
                interests me?
              </>,
              <>
                <strong>Why do I want to do it?</strong> Am I curious about research, or only attracted
                to the title?
              </>,
              <>
                <strong>What have I done so far?</strong> Which courses, skills, readings, or projects
                show my preparation?
              </>,
            ]}
          />
        </Block>
        <Block title="Build readiness step by step" tone="blue">
          <OrderedList
            items={[
              <>
                <strong>Explore:</strong> Faculty pages, research talks, introductory material
              </>,
              <>
                <strong>Build:</strong> Mathematics, programming, statistics
              </>,
              <>
                <strong>Learn:</strong> Advanced courses, textbooks and papers, reproduce a result
              </>,
              <>
                <strong>Approach:</strong> Show preparation, explain your interest, start realistically
              </>,
            ]}
          />
        </Block>
      </Grid>
      <Callout tone="red">
        <p>
          Approach a professor when you have enough foundation to contribute, even in a small way.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function InternshipScene() {
  return (
    <SceneFrame kicker="03 Explore" title="An internship helps you learn about work, and yourself">
      <Grid cols={2}>
        <Block title="What an internship gives you">
          <BulletList
            items={[
              <>
                <strong>Experience:</strong> See how knowledge is used in real tasks and teams
              </>,
              <>
                <strong>Feedback:</strong> Test which environments and types of work suit you
              </>,
              <>
                <strong>Growth:</strong> Practice communication, reliability, and responsibility
              </>,
            ]}
          />
        </Block>
        <Block title="Show evidence, not just intention" tone="blue">
          <p>
            Instead of &ldquo;I am passionate about data science,&rdquo; show:
          </p>
          <BulletList
            items={[
              "A project you can explain and improve",
              "Code that another person can understand",
              "Clear communication and reliable teamwork",
              "A concise resume with specific contributions",
            ]}
          />
        </Block>
      </Grid>
      <Callout>
        <p>
          The purpose is not to look experienced. It is to show what you can already do and what you
          are ready to learn.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function ExchangeScene() {
  return (
    <SceneFrame kicker="03 Explore" title="Overseas exchange expands how you learn">
      <Grid cols={2}>
        <Block title="Why consider it?">
          <BulletList
            items={[
              "Experience another academic environment",
              "Develop independence and adaptability",
              "Meet people with different perspectives",
            ]}
          />
        </Block>
        <Block title="Plan early" tone="blue">
          <BulletList
            items={[
              "Compare semester and summer options",
              "Check academic and credit arrangements",
              "Consult OAL and returning students",
              "Prepare applications well in advance",
            ]}
          />
        </Block>
      </Grid>
      <Callout tone="red">
        <p>Choose exchange for its learning value, not simply because it is overseas.</p>
      </Callout>
    </SceneFrame>
  );
}

export function CompetitionsScene() {
  return (
    <SceneFrame kicker="03 Explore" title="Competitions and projects turn skills into results">
      <Grid cols={2}>
        <Block title="Competitions">
          <BulletList
            items={[
              "Solve problems under time pressure",
              "Learn quickly from strong peers",
              "Test your skills against clear standards",
            ]}
          />
        </Block>
        <Block title="Projects" tone="blue">
          <BulletList
            items={[
              "Extend a course idea into something real",
              "Build with a team from start to finish",
              "Create work you can show and explain",
            ]}
          />
        </Block>
      </Grid>
      <Callout>
        <p>Choose them for what you will learn, not only for the award.</p>
      </Callout>
    </SceneFrame>
  );
}

export function WhereToLookScene() {
  return (
    <SceneFrame kicker="03 Explore" title="Know where to look, and whom to ask">
      <BulletList
        items={[
          <>
            <strong>Research:</strong> Faculty members, research groups, academic talks, PhD students
          </>,
          <>
            <strong>Internship:</strong> SDS Career Team, CPDO, employer events, alumni
          </>,
          <>
            <strong>Exchange:</strong> OAL, partner-university information, returning students
          </>,
          <>
            <strong>Competitions:</strong> Course instructors, school announcements, student teams
          </>,
          <>
            <strong>Projects &amp; clubs:</strong> Student clubs, project teams, hackathons, peers and
            upper-year students
          </>,
        ]}
      />
      <Callout tone="blue">
        <p>Websites give information; conversations give context.</p>
      </Callout>
    </SceneFrame>
  );
}

export function TurnIntoDirectionScene() {
  return (
    <SceneFrame kicker="03 Explore" title="Turn each experience into direction">
      <p className={styles.lead}>After each activity, ask yourself:</p>
      <BulletList
        items={[
          "What did I enjoy, and what drained me?",
          "What did I learn about my skills and interests?",
          "What evidence of my ability do I have now?",
          "Should I continue, adjust, or stop?",
        ]}
      />
      <Callout tone="red">
        <p>Exploration is only useful when it changes your next decision.</p>
      </Callout>
    </SceneFrame>
  );
}

export function GrowSectionScene() {
  return (
    <section className={`${styles.scene} ${styles.cover}`}>
      <div className={styles.coverInner}>
        <p className={styles.kicker}>04</p>
        <h1 className={styles.coverTitle}>Further Growth and Broader Development</h1>
        <p className={styles.lead}>Grow capabilities that last beyond your degree.</p>
      </div>
    </section>
  );
}

export function MoreThanKnowledgeScene() {
  return (
    <SceneFrame kicker="04 Grow" title="University develops more than knowledge">
      <OrderedList
        items={[
          <>
            <strong>Humanistic literacy:</strong> Understand people, culture, society, and different
            perspectives.
          </>,
          <>
            <strong>Critical thinking:</strong> Evaluate claims, evidence, and reasoning before
            reaching a judgment.
          </>,
          <>
            <strong>Whole-process capability:</strong> Carry a task from definition and planning to
            delivery and reflection.
          </>,
          <>
            <strong>Social adaptability:</strong> Work well with different people, situations,
            feedback, and change.
          </>,
        ]}
      />
      <Callout>
        <p>
          University prepares you not only to know more, but also to understand, think, act, and
          adapt.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function HumanisticLiteracyScene() {
  return (
    <SceneFrame kicker="04 Grow" title="Build humanistic literacy for your whole life">
      <p className={styles.lead}>
        Move beyond your major by engaging with ideas, culture, communities, and service.
      </p>
      <Grid cols={2}>
        <Block title="Seminars & reading: learn from ideas">
          <BulletList
            items={[
              "Seminars and talks by HSS, the Library, and MUS",
              "Humanities reading and public lectures",
            ]}
          />
        </Block>
        <Block title="City & culture: experience culture" tone="blue">
          <BulletList
            items={[
              "Museums, galleries, music halls, libraries",
              "Explore Shenzhen and the Greater Bay Area",
            ]}
          />
        </Block>
        <Block title="Campus life: join communities" tone="red">
          <BulletList
            items={[
              "Cultural and arts clubs",
              "OSA student activities",
              "College whole-person programs",
            ]}
          />
        </Block>
        <Block title="Social good: serve and reflect">
          <BulletList
            items={[
              "Volunteer programs, service-learning, social-good projects",
              "Reflect on people and communities",
            ]}
          />
        </Block>
      </Grid>
      <Callout tone="blue">
        <p>
          Humanistic literacy grows when you encounter different perspectives, and reflect on what
          they mean.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function CriticalThinkingScene() {
  return (
    <SceneFrame kicker="04 Grow" title="Turn critical thinking into a daily habit">
      <p className={styles.lead}>
        Use it whenever you read, check an answer, or discuss an idea.
      </p>
      <OrderedList
        items={[
          <>
            <strong>When reading: ask better questions</strong>
            <br />
            What is the main claim? What evidence supports it? What might be missing?
          </>,
          <>
            <strong>When checking AI or solutions: test the answer</strong>
            <br />
            Can I verify it with notes, sources, or code? Does each step follow logically?
          </>,
          <>
            <strong>When discussing: discuss and revise</strong>
            <br />
            Can I explain my reasoning? Have I considered another view? What evidence would change my
            mind?
          </>,
        ]}
      />
      <Callout tone="red">
        <p>The goal is not to doubt everything. It is to know why you believe something.</p>
      </Callout>
    </SceneFrame>
  );
}

export function CarryTaskScene() {
  return (
    <SceneFrame kicker="04 Grow" title="Carry a task from idea to outcome">
      <p className={styles.lead}>
        A good idea matters only when you can develop, complete, and improve it.
      </p>
      <OrderedList
        items={[
          <>
            <strong>Define the task:</strong> Clarify the goal, constraints, and what success means.
          </>,
          <>
            <strong>Make a plan:</strong> Break the task into steps. Set priorities, roles, and
            deadlines.
          </>,
          <>
            <strong>Do the work:</strong> Start, track progress, solve problems, and coordinate.
          </>,
          <>
            <strong>Deliver the result:</strong> Complete the work and communicate it clearly and on
            time.
          </>,
          <>
            <strong>Reflect and improve:</strong> Review what worked, what failed, and what to change
            next time.
          </>,
        ]}
      />
      <Callout>
        <p>
          Capability is not only having ideas; it is carrying a task through to a meaningful result.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function AdaptPeopleScene() {
  return (
    <SceneFrame kicker="04 Grow" title="Adapt to people and situations effectively">
      <p className={styles.lead}>
        Working well with others requires communication, judgment, and responsibility.
      </p>
      <OrderedList
        items={[
          <>
            <strong>Read the situation:</strong> Notice expectations, roles, norms, and constraints
            before you act.
          </>,
          <>
            <strong>Communicate clearly:</strong> Listen, ask questions, explain your needs, and handle
            disagreement respectfully.
          </>,
          <>
            <strong>Work across differences:</strong> Collaborate with people who have different
            backgrounds, styles, and priorities.
          </>,
          <>
            <strong>Adjust and follow through:</strong> Use feedback, change your approach, and take
            responsibility for commitments.
          </>,
        ]}
      />
      <Callout tone="blue">
        <p>
          Adaptability is not simply fitting in. It is responding effectively while keeping your
          values and responsibilities.
        </p>
      </Callout>
    </SceneFrame>
  );
}

export function CommitmentsScene() {
  return (
    <SceneFrame kicker="Your first-semester commitments" title="What can you do next?">
      <OrderedList
        items={[
          <>
            <strong>Learn consistently:</strong> Review and practice every week
          </>,
          <>
            <strong>Ask early:</strong> Use instructors, TAs, advisors, and peers
          </>,
          <>
            <strong>Explore selectively:</strong> Choose one meaningful opportunity
          </>,
          <>
            <strong>Stay well:</strong> Protect sleep, relationships, and recovery
          </>,
        ]}
      />
      <Callout tone="red">
        <p>One small action is more valuable than one perfect plan.</p>
      </Callout>
    </SceneFrame>
  );
}
