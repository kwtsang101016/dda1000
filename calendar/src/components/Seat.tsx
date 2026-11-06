import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { DisplayPerson } from "../lib/attendance";
import { NameCard } from "./NameCard";

interface SeatProps {
  seatCount: number;
  seatLabel: string;
  occupant?: DisplayPerson;
  selected?: boolean;
  hasPlan?: boolean;
  onSelect?: (personId: string) => void;
}

const HOLD_MS = 280;

export function Seat({
  seatCount,
  seatLabel,
  occupant,
  selected = false,
  hasPlan = false,
  onSelect,
}: SeatProps) {
  const [holding, setHolding] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const openedHoldRef = useRef(false);

  const clearHoldTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearHoldTimer(), []);

  const releasePointer = () => {
    const button = buttonRef.current;
    const pointerId = pointerIdRef.current;
    if (button && pointerId !== null && button.hasPointerCapture(pointerId)) {
      button.releasePointerCapture(pointerId);
    }
    pointerIdRef.current = null;
  };

  const startHold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!occupant || event.button !== 0) {
      return;
    }
    clearHoldTimer();
    pointerIdRef.current = event.pointerId;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Hold still works via up/cancel without capture.
    }
    timerRef.current = window.setTimeout(() => {
      openedHoldRef.current = true;
      setHolding(true);
    }, HOLD_MS);
  };

  const endHold = () => {
    const openedPreview = openedHoldRef.current;
    openedHoldRef.current = false;
    clearHoldTimer();
    setHolding(false);
    releasePointer();
    if (!openedPreview && occupant && onSelect) {
      onSelect(occupant.id);
    }
  };

  return (
    <button
      type="button"
      ref={buttonRef}
      className={[
        "seat",
        occupant ? "seat--filled" : "seat--empty",
        selected ? "seat--selected" : "",
        hasPlan ? "seat--plan" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--seat-count" as string]: seatCount }}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      aria-label={occupant ? `${occupant.displayName} · ${seatLabel}` : `Empty seat ${seatLabel}`}
    >
      {occupant ? (
        <>
          <span className="seat__id">{seatLabel}</span>
          <NameCard person={occupant} compact />
        </>
      ) : (
        <span className="seat__placeholder">{seatLabel}</span>
      )}
      {holding && occupant
        ? createPortal(
            <div className="seat-preview-overlay" role="presentation" aria-hidden="true">
              <div className="seat-preview-card">
                <NameCard person={occupant} enlarged />
              </div>
            </div>,
            document.body,
          )
        : null}
    </button>
  );
}
