import { useDroppable } from "@dnd-kit/core";
import type { Person } from "../../shared/types.ts";
import { DraggableNameCard } from "./NameCard.tsx";

interface SeatProps {
  id: string;
  occupant?: Person;
  highlighted?: boolean;
}

export function Seat({ id, occupant, highlighted }: SeatProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={["seat", isOver ? "seat--over" : "", occupant ? "seat--filled" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {occupant ? (
        <DraggableNameCard person={occupant} compact highlighted={highlighted} />
      ) : (
        <span className="seat__placeholder">sit here</span>
      )}
    </div>
  );
}
