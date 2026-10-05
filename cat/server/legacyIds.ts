import { hashSecret } from "./credentials.ts";
import type { ClassroomState } from "../shared/types.ts";

/** Legacy card ids embedded the student number, e.g. "stu-<student number>". */
const LEGACY_ID = /^(?:stu|pa)-(\d{6,})$/;

export interface LegacyMigrationResult {
  state: ClassroomState;
  renamed: number;
  unresolved: number;
}

/**
 * Re-keys saved seats and profiles from legacy ids to the current neutral ids by matching
 * the embedded student number against the salted credential hashes. Unresolved entries are
 * kept untouched so a mistyped salt never deletes students' photos.
 */
export function migrateLegacyIds(
  state: ClassroomState,
  hashes: Record<string, string | null>,
  salt: string,
): LegacyMigrationResult {
  const idByHash = new Map<string, string>();
  for (const [personId, hash] of Object.entries(hashes)) {
    if (hash) {
      idByHash.set(hash, personId);
    }
  }

  let renamed = 0;
  let unresolved = 0;

  const rekey = <T>(entries: Record<string, T>): Record<string, T> => {
    const result: Record<string, T> = {};
    const legacy: [string, T][] = [];
    for (const [key, value] of Object.entries(entries)) {
      if (LEGACY_ID.test(key)) {
        legacy.push([key, value]);
      } else {
        result[key] = value;
      }
    }
    for (const [key, value] of legacy) {
      const studentNumber = LEGACY_ID.exec(key)?.[1] ?? "";
      const currentId = idByHash.get(hashSecret(studentNumber, salt));
      if (!currentId) {
        result[key] = value;
        unresolved += 1;
        continue;
      }
      if (!(currentId in result)) {
        result[currentId] = value;
      }
      renamed += 1;
    }
    return result;
  };

  return {
    state: {
      ...state,
      placements: rekey(state.placements),
      profiles: rekey(state.profiles),
    },
    renamed,
    unresolved,
  };
}
