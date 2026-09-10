import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export interface CredentialFile {
  algo: string;
  hashes: Record<string, string | null>;
}

export function normalizeSecret(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function hashSecret(value: string): string {
  return createHash("sha256").update(normalizeSecret(value), "utf8").digest("hex");
}

export function secretsMatch(provided: string, expectedHash: string | null | undefined): boolean {
  if (!expectedHash) {
    return false;
  }
  const normalized = normalizeSecret(provided);
  if (!normalized) {
    return false;
  }
  return hashSecret(normalized) === expectedHash;
}

export async function loadCredentialHashes(path: string): Promise<Record<string, string | null>> {
  const raw = await readFile(path, "utf8");
  const parsed = JSON.parse(raw) as CredentialFile;
  if (!parsed.hashes || typeof parsed.hashes !== "object") {
    throw new Error("credentials.json is missing hashes.");
  }
  return parsed.hashes;
}
