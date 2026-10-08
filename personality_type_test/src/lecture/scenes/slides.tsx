import styles from "../Lecture.module.css";
import { Callout, SceneFrame } from "./shared";

const TEST_URL = "https://www.16personalities.com";

export function NextWeekScene() {
  return (
    <SceneFrame tone="white">
      <p className={styles.alertHeading}>NEXT WEEK !</p>
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
