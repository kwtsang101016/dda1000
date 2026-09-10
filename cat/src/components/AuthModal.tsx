import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface AuthModalProps {
  personName: string;
  /** AA / people without student ID can only use instructor PIN. */
  requiresInstructorOnly?: boolean;
  busy?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (secret: string, asInstructor: boolean) => void;
}

export function AuthModal({
  personName,
  requiresInstructorOnly = false,
  busy = false,
  error = null,
  onCancel,
  onSubmit,
}: AuthModalProps) {
  const [secret, setSecret] = useState("");
  const [asInstructor, setAsInstructor] = useState(requiresInstructorOnly);
  const allowDismissRef = useRef(false);

  useEffect(() => {
    setAsInstructor(requiresInstructorOnly);
  }, [requiresInstructorOnly]);

  useEffect(() => {
    allowDismissRef.current = false;
    const timer = window.setTimeout(() => {
      allowDismissRef.current = true;
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && allowDismissRef.current) {
        onCancel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const dismiss = () => {
    if (!allowDismissRef.current || busy) {
      return;
    }
    onCancel();
  };

  return createPortal(
    <div className="modal-backdrop" role="presentation" onClick={dismiss}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="eyebrow">Verify to continue</p>
            <h2 id="auth-modal-title">{personName}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={dismiss}>
            Close
          </button>
        </header>

        <p className="modal__help">
          {requiresInstructorOnly || asInstructor
            ? "Enter the instructor PIN to manage this card or the table layout."
            : "Enter your student ID to sit, move, stand up, or edit this card. IDs are checked on the server and are not shown on the page."}
        </p>

        {!requiresInstructorOnly ? (
          <label className="check-row">
            <input
              type="checkbox"
              checked={asInstructor}
              onChange={(event) => setAsInstructor(event.target.checked)}
            />
            I am the instructor (use instructor PIN)
          </label>
        ) : null}

        <label className="field">
          {asInstructor || requiresInstructorOnly ? "Instructor PIN" : "Student ID"}
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && secret.trim()) {
                onSubmit(secret.trim(), asInstructor || requiresInstructorOnly);
              }
            }}
          />
        </label>

        {error ? <p className="modal__error">{error}</p> : null}

        <div className="modal__actions">
          <button type="button" className="ghost-button" onClick={dismiss} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={busy || !secret.trim()}
            onClick={() => onSubmit(secret.trim(), asInstructor || requiresInstructorOnly)}
          >
            {busy ? "Checking…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
