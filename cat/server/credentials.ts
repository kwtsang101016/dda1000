import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";

export const CREDENTIAL_ALGO = "hmac-sha256-alnum-lower";

export interface CredentialFile {
  algo: string;
  hashes: Record<string, string | null>;
}

export function normalizeSecret(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Keyed hash: without the salt, short student numbers cannot be brute-forced from the public hashes. */
export function hashSecret(value: string, salt: string): string {
  return createHmac("sha256", salt).update(normalizeSecret(value), "utf8").digest("hex");
}

export function secretsMatch(provided: string, expectedHash: string | null | undefined, salt: string): boolean {
  if (!expectedHash || !salt) {
    return false;
  }
  const normalized = normalizeSecret(provided);
  if (!normalized) {
    return false;
  }
  const actual = Buffer.from(hashSecret(normalized, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function loadCredentialHashes(path: string): Promise<Record<string, string | null>> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as CredentialFile;
  if (parsed.algo !== CREDENTIAL_ALGO) {
    throw new Error(`credentials.json uses "${parsed.algo}", expected "${CREDENTIAL_ALGO}".`);
  }
  if (!parsed.hashes || typeof parsed.hashes !== "object") {
    throw new Error("credentials.json is missing hashes.");
  }
  return parsed.hashes;
}
