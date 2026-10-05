/**
 * PDF handout export.
 *
 * Capture one slide at a time into a temporary host, and tell html2canvas to
 * ignore the off-screen handout mount so the document clone stays small.
 */
import { DECK } from "./deck";

const FILENAME = DECK.pdfFilename;

const PAGE_MARGIN_MM = 8;
const HANDOUT_DESIGN_WIDTH = 1120;
const CAPTURE_SCALE = 1.5;

export type DownloadHandoutOptions = {
  onProgress?: (done: number, total: number) => void;
};

function collectInlineCssText(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        chunks.push(rule.cssText);
      }
    } catch {
      // Cross-origin sheets cannot be read.
    }
  }
  return chunks.join("\n");
}

function collectCrossOriginStyleLinks(): string {
  return [...document.querySelectorAll('link[rel="stylesheet"]')]
    .filter((node) => {
      const link = node as HTMLLinkElement;
      try {
        const sheet = [...document.styleSheets].find((candidate) => candidate.href === link.href);
        if (!sheet) return true;
        void sheet.cssRules;
        return false;
      } catch {
        return true;
      }
    })
    .map((node) => `<link rel="stylesheet" href="${(node as HTMLLinkElement).href}" />`)
    .join("\n");
}

function unclipOverflowInClone(element: HTMLElement): void {
  element.style.setProperty("overflow", "visible", "important");
  element.style.setProperty("overflow-x", "visible", "important");
  element.style.setProperty("overflow-y", "visible", "important");

  for (const node of element.querySelectorAll<HTMLElement>(
    ".tableWrap, table, svg, img, figure",
  )) {
    node.style.setProperty("overflow", "visible", "important");
    node.style.setProperty("overflow-x", "visible", "important");
    node.style.setProperty("overflow-y", "visible", "important");
  }

  for (const svg of element.querySelectorAll("svg")) {
    svg.setAttribute("overflow", "visible");
    svg.style.setProperty("overflow", "visible", "important");
    svg.style.setProperty("max-width", "100%", "important");
    svg.style.setProperty("width", "100%", "important");
    svg.style.setProperty("height", "auto", "important");
  }
}

async function nextFrame(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function yieldToUi(): Promise<void> {
  await new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), 0);
  });
}

function captureWidth(): number {
  return Math.min(HANDOUT_DESIGN_WIDTH, Math.max(720, window.innerWidth - 16));
}

function handoutPages(source: HTMLElement): HTMLElement[] {
  return [...source.querySelectorAll<HTMLElement>("[data-handout-page]")];
}

function createCaptureHost(width: number): HTMLElement {
  const host = document.createElement("div");
  host.setAttribute("data-pdf-export-host", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${width}px`,
    margin: "0",
    padding: "0",
    background: "#fff4d2",
    visibility: "visible",
    opacity: "1",
    pointerEvents: "none",
    zIndex: "-1",
    overflow: "visible",
  } as Partial<CSSStyleDeclaration>);
  document.body.appendChild(host);
  return host;
}

/**
 * One slide → one PDF page. Each slide is captured as a single image and scaled
 * to fit inside the A4 printable area.
 */
export async function downloadHandoutPdf(
  source: HTMLElement,
  options: DownloadHandoutOptions = {},
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pages = handoutPages(source);
  if (pages.length === 0) {
    throw new Error("No handout pages found to export.");
  }

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  const width = captureWidth();
  const host = createCaptureHost(width);
  await nextFrame();

  try {
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - 2 * PAGE_MARGIN_MM;
    const usableHeight = pageHeight - 2 * PAGE_MARGIN_MM;

    for (let index = 0; index < pages.length; index += 1) {
      options.onProgress?.(index + 1, pages.length);

      host.replaceChildren();
      const clone = pages[index].cloneNode(true) as HTMLElement;
      clone.style.width = `${width}px`;
      clone.style.background = "#fff4d2";
      clone.style.boxSizing = "border-box";
      clone.style.overflow = "visible";
      host.appendChild(clone);

      await nextFrame();

      const canvas = await html2canvas(clone, {
        scale: CAPTURE_SCALE,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#fff4d2",
        width: Math.max(clone.scrollWidth, width),
        windowWidth: Math.max(clone.scrollWidth, width),
        windowHeight: Math.max(clone.scrollHeight, clone.clientHeight, 1),
        ignoreElements: (element) => {
          if (!(element instanceof HTMLElement)) return false;
          if (element === host || host.contains(element)) return false;
          // Skip the off-screen handout and the live stage clone cost.
          if (element.hasAttribute("data-handout-mount")) return true;
          if (element.hasAttribute("data-lecture-stage")) return true;
          if (element.hasAttribute("data-handout-page")) return true;
          return false;
        },
        onclone: (_document: Document, element: HTMLElement) => {
          unclipOverflowInClone(element);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      const unscaledHeight = (canvas.height * usableWidth) / canvas.width;
      const fit = Math.min(1, usableHeight / unscaledHeight);
      const drawWidth = usableWidth * fit;
      const drawHeight = unscaledHeight * fit;
      const offsetX = PAGE_MARGIN_MM + (usableWidth - drawWidth) / 2;
      const offsetY = PAGE_MARGIN_MM + (usableHeight - drawHeight) / 2;

      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "JPEG", offsetX, offsetY, drawWidth, drawHeight, undefined, "FAST");

      // Drop the canvas reference and let the UI breathe between heavy captures.
      canvas.width = 0;
      canvas.height = 0;
      await yieldToUi();
    }

    options.onProgress?.(pages.length, pages.length);
    pdf.save(FILENAME);
  } finally {
    host.remove();
  }
}

export async function printHandout(source: HTMLElement): Promise<void> {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    throw new Error("Pop-up blocked. Allow pop-ups, or use Download PDF instead.");
  }

  const inlineCss = collectInlineCssText();
  const crossOriginLinks = collectCrossOriginStyleLinks();
  printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${FILENAME.replace(".pdf", "")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />
  ${crossOriginLinks}
  <style>
    ${inlineCss}
    @page { size: A4; margin: 10mm; }
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #16213c; background: #fff4d2; }
    [data-handout-page] {
      break-after: page;
      page-break-after: always;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    [data-handout-page]:last-child {
      break-after: auto;
      page-break-after: auto;
    }
    table, tr, img, svg {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .tableWrap, svg {
      overflow: visible !important;
    }
  </style>
</head>
<body>${source.outerHTML}</body>
</html>`);
  printWindow.document.close();

  await new Promise<void>((resolve) => {
    const finish = () => resolve();
    const waitFonts = () => {
      const fonts = printWindow.document.fonts;
      if (fonts?.ready) {
        void fonts.ready.then(finish).catch(finish);
      } else {
        finish();
      }
    };
    if (printWindow.document.readyState === "complete") {
      waitFonts();
    } else {
      printWindow.onload = () => waitFonts();
    }
    window.setTimeout(finish, 4000);
  });

  printWindow.focus();
  printWindow.print();
  printWindow.onafterprint = () => printWindow.close();
}
