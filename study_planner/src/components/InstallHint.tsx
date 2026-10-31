import { useEffect, useState } from "react";
import "./InstallHint.css";

const STORAGE_KEY = "dda1000-planner-install-hint-dismissed";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function InstallHint() {
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || !isMobile()) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIos(ios);
    setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="install-hint" role="note" aria-label="Add to home screen">
      <div className="install-hint__content">
        <strong>Add to Home Screen</strong>
        {isIos ? (
          <p>
            Tap <span className="install-hint__icon">Share</span> in Safari, then{" "}
            <span className="install-hint__icon">Add to Home Screen</span>. Open the app
            from the new icon anytime.
          </p>
        ) : (
          <p>
            Tap the browser menu <span className="install-hint__icon">⋮</span>, then{" "}
            <span className="install-hint__icon">Install app</span> or{" "}
            <span className="install-hint__icon">Add to Home screen</span>.
          </p>
        )}
      </div>
      <button type="button" className="install-hint__close" onClick={dismiss} aria-label="Dismiss">
        ×
      </button>
    </aside>
  );
}
