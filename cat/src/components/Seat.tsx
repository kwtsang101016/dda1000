import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DisplayPerson } from "../lib/people.ts";
import { NameCard } from "./NameCard.tsx";

interface SeatProps {
  seatCount: number;
  occupant?: DisplayPerson;
  selected?: boolean;
  targetable?: boolean;
  highlighted?: boolean;
  onSelect: () => void;
  onDoubleUnseat: () => void;
}

const HOLD_MS = 280;

export function Seat({
  seatCount,
  occupant,
  selected = false,
  targetable = false,
  highlighted = false,
  onSelect,
  onDoubleUnseat,
}: SeatProps) {
  const [holding, setHolding] = useState(false);
  const [previewPos, setPreviewPos] = useState<{ left: number; top: number; place: "above" | "below" } | null>(
    null,
  );
  const seatRef = useRef<HTMLButtonElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const heldRef = useRef(false);

  const clearHoldTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const updatePreviewPosition = () => {
    const seat = seatRef.current;
    if (!seat) {
      return;
    }
    const rect = seat.getBoundingClientRect();
    const previewHeight = 180;
    const gap = 10;
    const placeAbove = rect.top >= previewHeight + gap + 8;
    setPreviewPos({
      left: rect.left + rect.width / 2,
      top: placeAbove ? rect.top - gap : rect.bottom + gap,
      place: placeAbove ? "above" : "below",
    });
  };

  useEffect(() => () => clearHoldTimer(), []);

  useLayoutEffect(() => {
    if (!holding) {
      setPreviewPos(null);
      return;
    }
    updatePreviewPosition();
    const onViewportChange = () => updatePreviewPosition();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [holding]);

  const startHold = () => {
    if (!occupant) {
      return;
    }
    heldRef.current = false;
    clearHoldTimer();
    timerRef.current = window.setTimeout(() => {
      heldRef.current = true;
      setHolding(true);
    }, HOLD_MS);
  };

  const endHold = () => {
    clearHoldTimer();
    setHolding(false);
  };

  return (
    <button
      type="button"
      ref={seatRef}
      className={[
        "seat",
        occupant ? "seat--filled" : "seat--empty",
        selected ? "seat--selected" : "",
        targetable ? "seat--targetable" : "",
        holding ? "seat--holding" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--seat-count" as string]: seatCount }}
      onClick={() => {
        if (heldRef.current) {
          heldRef.current = false;
          return;
        }
        onSelect();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        if (occupant) {
          onDoubleUnseat();
        }
      }}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerCancel={endHold}
      onPointerLeave={endHold}
      aria-label={occupant ? `${occupant.name} seat` : "Empty seat"}
    >
      {occupant ? (
        <NameCard person={occupant} compact selected={selected} highlighted={highlighted} />
      ) : (
        <span className="seat__placeholder">sit here</span>
      )}
      {holding && occupant && previewPos
        ? createPortal(
            <div
              className={`seat-preview seat-preview--${previewPos.place}`}
              role="presentation"
              style={{ left: previewPos.left, top: previewPos.top }}
            >
              <NameCard person={occupant} enlarged />
            </div>,
            document.body,
          )
        : null}
    </button>
  );
}
