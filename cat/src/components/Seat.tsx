import { useEffect, useRef, useState } from "react";
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
  const timerRef = useRef<number | null>(null);
  const heldRef = useRef(false);

  const clearHoldTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearHoldTimer(), []);

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
      {holding && occupant ? (
        <div className="seat-preview" role="presentation">
          <NameCard person={occupant} enlarged />
        </div>
      ) : null}
    </button>
  );
}
