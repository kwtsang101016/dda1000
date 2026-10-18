import type { CSSProperties, ReactNode } from "react";
import styles from "../Lecture.module.css";

type Tone = "ink" | "blue" | "red";

export function SceneFrame({
  kicker,
  title,
  subtitle,
  tone = "cream",
  children,
}: {
  kicker?: string;
  title?: string;
  subtitle?: string;
  tone?: "cream" | "gold" | "white" | "dark";
  children?: ReactNode;
}) {
  const toneClass =
    tone === "gold" ? styles.gold : tone === "white" ? styles.whiteScene : tone === "dark" ? styles.dark : "";
  return (
    <section className={`${styles.scene} ${toneClass}`}>
      {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
      {title ? <h1>{title}</h1> : null}
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {children}
    </section>
  );
}

/** Beamer-style block: coloured title bar over a white body. */
export function Block({ title, tone = "ink", children }: { title: string; tone?: Tone; children: ReactNode }) {
  const toneClass = tone === "blue" ? styles.block_blue : tone === "red" ? styles.block_red : "";
  return (
    <div className={`${styles.block} ${toneClass}`}>
      <p className={styles.blockTitle}>{title}</p>
      <div className={styles.blockBody}>{children}</div>
    </div>
  );
}

/** Untitled emphasis box (beamer block without a title). */
export function Callout({ tone = "ink", icon, children }: { tone?: Tone; icon?: string; children: ReactNode }) {
  const toneClass = tone === "blue" ? styles.callout_blue : tone === "red" ? styles.callout_red : "";
  return (
    <div className={`${styles.callout} ${toneClass} ${icon ? styles.calloutWithIcon : ""}`}>
      {icon ? <span className={styles.calloutIcon} aria-hidden="true">{icon}</span> : null}
      {icon ? <div>{children}</div> : children}
    </div>
  );
}

export function Grid({ cols = 2, children }: { cols?: number; children: ReactNode }) {
  return (
    <div className={styles.grid} style={{ ["--cols" as string]: String(cols) } as CSSProperties}>
      {children}
    </div>
  );
}

export function Figure({ src, alt, width, caption }: { src: string; alt: string; width?: string; caption?: string }) {
  const resolved =
    src.startsWith("http") || src.startsWith(import.meta.env.BASE_URL)
      ? src
      : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`;
  return (
    <figure className={styles.figureWrap}>
      <img src={resolved} alt={alt} style={{ width: width ?? "100%", maxWidth: "100%" }} />
      {caption ? <figcaption className={styles.figureCaption}>{caption}</figcaption> : null}
    </figure>
  );
}

export function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function OrderedList({ items }: { items: ReactNode[] }) {
  return (
    <ol className={styles.orderedList}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );
}

/** Text table; the first column is set in bold like the source slides. */
export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className={styles.tableWrap}>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={cellIndex === 0 ? styles.rowHead : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Speaker notes from the original slides, shown under the slide content. */
export function Notes({ paragraphs }: { paragraphs: string[] }) {
  return (
    <aside className={styles.notes}>
      <span className={styles.notesLabel}>Notes</span>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </aside>
  );
}
