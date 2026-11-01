import {
  claimableStreams,
  evaluateCseGroupAUnits,
  evaluateStaDepth,
  evaluateStreamProgress,
  type StreamProgress,
} from "../data/streamRequirements";
import type { MajorId, StreamTag } from "../data/types";
import { getCourse } from "./courseUtils";

export function collectedMajorCodes(
  assignments: Record<string, string | null>,
): string[] {
  return Object.values(assignments).filter((c): c is string => Boolean(c));
}

export function analyzeClaimedStream(
  major: MajorId,
  claimed: StreamTag | null,
  takenCodes: string[],
): StreamProgress | null {
  if (!claimed) return null;
  if (!claimableStreams(major).includes(claimed)) return null;
  return evaluateStreamProgress(claimed, takenCodes);
}

export function analyzeExtraMajorChecks(
  major: MajorId,
  takenCodes: string[],
): {
  staDepth: StreamProgress | null;
  cseGroupA: ReturnType<typeof evaluateCseGroupAUnits> | null;
} {
  return {
    staDepth: major === "STA" ? evaluateStaDepth(takenCodes) : null,
    cseGroupA:
      major === "CSE"
        ? evaluateCseGroupAUnits(
            takenCodes,
            (code) => getCourse(code)?.units ?? 3,
          )
        : null,
  };
}
