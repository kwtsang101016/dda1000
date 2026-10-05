/**
 * Prints the salted hash to paste into server/data/credentials.json for a new roster card.
 *
 * Usage: npm run hash-id -- <studentId>
 * Reads the salt from STUDENT_ID_SALT, or from private/STUDENT_ID_SALT.txt (never committed).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashSecret, normalizeSecret } from "../server/credentials.ts";

const catDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const saltFile = path.join(catDir, "private", "STUDENT_ID_SALT.txt");

async function readSalt(): Promise<string> {
  const fromEnv = process.env.STUDENT_ID_SALT?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  try {
    const fromFile = (await readFile(saltFile, "utf8")).trim();
    if (fromFile) {
      return fromFile;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
  throw new Error(`No salt found. Set STUDENT_ID_SALT or create ${saltFile}.`);
}

async function main(): Promise<void> {
  const studentId = process.argv[2] ?? "";
  if (!normalizeSecret(studentId)) {
    throw new Error("Usage: npm run hash-id -- <studentId>");
  }
  console.log(hashSecret(studentId, await readSalt()));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
