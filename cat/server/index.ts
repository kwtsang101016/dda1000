import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server, type Socket } from "socket.io";
import { loadCredentialHashes, secretsMatch } from "./credentials.ts";
import { durableStoreEnabled, loadClassroomState, persistClassroomState } from "./stateStore.ts";
import {
  DEFAULT_STATE,
  isSeatRef,
  normalizeProfile,
  placePerson,
  resetSeating,
  setLayout,
  unseatPerson,
  updateProfile,
} from "../shared/seating.ts";
import type { ClassroomState, Roster, ServerSnapshot } from "../shared/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const statePath = path.join(rootDir, "data", "state.json");
const rosterPath = path.join(rootDir, "src", "data", "roster.json");
const credentialsPath = path.join(rootDir, "server", "data", "credentials.json");
const distDir = path.join(rootDir, "dist");
const PORT = Number(process.env.PORT) || 3001;
const DEFAULT_PIN = "change-me-dda1000";
const INSTRUCTOR_PIN = process.env.INSTRUCTOR_PIN || DEFAULT_PIN;

interface SocketAuth {
  isInstructor: boolean;
  authorizedIds: Set<string>;
}

let state: ClassroomState = DEFAULT_STATE;
let personIds = new Set<string>();
let credentialHashes: Record<string, string | null> = {};

function getAuth(socket: Socket): SocketAuth {
  const data = socket.data as { auth?: SocketAuth };
  if (!data.auth) {
    data.auth = { isInstructor: false, authorizedIds: new Set() };
  }
  return data.auth;
}

function emitAuthState(socket: Socket): void {
  const auth = getAuth(socket);
  socket.emit("auth-state", {
    isInstructor: auth.isInstructor,
    authorizedIds: [...auth.authorizedIds],
  });
}

function canControl(socket: Socket, personId: string): boolean {
  const auth = getAuth(socket);
  return auth.isInstructor || auth.authorizedIds.has(personId);
}

function requireControl(socket: Socket, personId: string): void {
  if (!canControl(socket, personId)) {
    throw new Error("Enter this person's student ID (or the instructor PIN) to continue.");
  }
}

function requireInstructor(socket: Socket): void {
  if (!getAuth(socket).isInstructor) {
    throw new Error("Only the instructor can change the table layout or reset seats.");
  }
}

async function loadRoster(): Promise<Roster> {
  try {
    const raw = await readFile(rosterPath, "utf8");
    const parsed = JSON.parse(raw) as Roster;
    if (!Array.isArray(parsed.people) || parsed.people.length === 0) {
      throw new Error("Roster does not contain any people.");
    }
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to load class roster from ${rosterPath}: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

async function loadCredentials(): Promise<Record<string, string | null>> {
  return loadCredentialHashes(credentialsPath);
}

async function loadState(): Promise<ClassroomState> {
  return loadClassroomState(statePath);
}

async function persistState(next: ClassroomState): Promise<void> {
  try {
    await persistClassroomState(statePath, next);
  } catch (error) {
    console.error("Failed to persist classroom state:", error);
  }
}

function snapshot(connectedCount: number): ServerSnapshot {
  return { state, connectedCount };
}

async function main(): Promise<void> {
  const roster = await loadRoster();
  credentialHashes = await loadCredentials();
  personIds = new Set(roster.people.map((person) => person.id));
  state = await loadState();

  // Migrate previous default layout (5×8) to the classroom layout (4×10).
  if (state.studentRowCount === 5 && state.seatsPerRow === 8) {
    state = setLayout(state, 4, 10);
    await persistState(state);
    console.log("Updated classroom layout default to 4 student rows × 10 seats.");
  }

  if (!durableStoreEnabled()) {
    console.warn(
      "No Upstash Redis configured. On Render, seating/profile data will be erased whenever the service redeploys.",
    );
  }

  if (INSTRUCTOR_PIN === DEFAULT_PIN) {
    console.warn(
      `INSTRUCTOR_PIN is still the default ("${DEFAULT_PIN}"). Set INSTRUCTOR_PIN on Render before class.`,
    );
  }

  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "250kb" }));

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      course: roster.course,
      section: roster.section,
      durableStore: durableStoreEnabled(),
    });
  });

  const hasDist = existsSync(distDir);
  if (hasDist) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") {
        next();
        return;
      }
      if (req.path.startsWith("/socket.io") || req.path === "/health") {
        next();
        return;
      }
      res.sendFile(path.join(distDir, "index.html"), (error) => {
        if (error) {
          next(error);
        }
      });
    });
  }

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: true },
    pingInterval: 8000,
    pingTimeout: 15000,
    maxHttpBufferSize: 3e5,
  });

  const emitState = (): void => {
    io.emit("snapshot", snapshot(io.engine.clientsCount));
  };

  io.on("connection", (socket) => {
    getAuth(socket);
    emitAuthState(socket);
    socket.emit("snapshot", snapshot(io.engine.clientsCount));
    socket.broadcast.emit("presence", { connectedCount: io.engine.clientsCount });

    socket.on("authorize", (payload: unknown, ack?: (response: { ok: boolean; message?: string }) => void) => {
      try {
        if (typeof payload !== "object" || payload === null) {
          throw new Error("Invalid authorization payload.");
        }
        const { personId, secret, asInstructor } = payload as {
          personId?: unknown;
          secret?: unknown;
          asInstructor?: unknown;
        };
        if (typeof secret !== "string" || !secret.trim()) {
          throw new Error("Enter a student ID or instructor PIN.");
        }

        const auth = getAuth(socket);

        if (asInstructor) {
          if (secret !== INSTRUCTOR_PIN) {
            throw new Error("Instructor PIN is incorrect.");
          }
          auth.isInstructor = true;
          emitAuthState(socket);
          ack?.({ ok: true });
          return;
        }

        if (typeof personId !== "string" || !personIds.has(personId)) {
          throw new Error("Unknown name card.");
        }

        const expected = credentialHashes[personId];
        if (!expected) {
          throw new Error("This card can only be managed with the instructor PIN.");
        }
        if (!secretsMatch(secret, expected)) {
          throw new Error("Student ID does not match.");
        }

        auth.authorizedIds.add(personId);
        emitAuthState(socket);
        ack?.({ ok: true });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Authorization failed.";
        ack?.({ ok: false, message });
        socket.emit("error-message", message);
      }
    });

    socket.on("place", async (payload: unknown) => {
      try {
        if (typeof payload !== "object" || payload === null) {
          throw new Error("Invalid place payload.");
        }
        const { personId, target } = payload as { personId?: unknown; target?: unknown };
        if (typeof personId !== "string" || !personIds.has(personId)) {
          throw new Error("Unknown name card.");
        }
        if (!isSeatRef(target)) {
          throw new Error("Invalid seat.");
        }
        requireControl(socket, personId);
        state = placePerson(state, personId, target);
        await persistState(state);
        emitState();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not place that card.";
        socket.emit("error-message", message);
      }
    });

    socket.on("unseat", async (payload: unknown) => {
      try {
        if (typeof payload !== "object" || payload === null) {
          throw new Error("Invalid unseat payload.");
        }
        const { personId } = payload as { personId?: unknown };
        if (typeof personId !== "string" || !personIds.has(personId)) {
          throw new Error("Unknown name card.");
        }
        requireControl(socket, personId);
        state = unseatPerson(state, personId);
        await persistState(state);
        emitState();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not return that card.";
        socket.emit("error-message", message);
      }
    });

    socket.on("setLayout", async (payload: unknown) => {
      try {
        requireInstructor(socket);
        if (typeof payload !== "object" || payload === null) {
          throw new Error("Invalid layout payload.");
        }
        const { studentRowCount, seatsPerRow } = payload as {
          studentRowCount?: unknown;
          seatsPerRow?: unknown;
        };
        if (typeof studentRowCount !== "number" || typeof seatsPerRow !== "number") {
          throw new Error("Row and seat counts must be numbers.");
        }
        state = setLayout(state, studentRowCount, seatsPerRow);
        await persistState(state);
        emitState();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not update the layout.";
        socket.emit("error-message", message);
      }
    });

    socket.on("updateProfile", async (payload: unknown) => {
      try {
        if (typeof payload !== "object" || payload === null) {
          throw new Error("Invalid profile payload.");
        }
        const { personId, profile } = payload as { personId?: unknown; profile?: unknown };
        if (typeof personId !== "string" || !personIds.has(personId)) {
          throw new Error("Unknown name card.");
        }
        requireControl(socket, personId);
        const normalized = normalizeProfile(profile);
        state = updateProfile(state, personId, normalized);
        await persistState(state);
        emitState();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not save the name card.";
        socket.emit("error-message", message);
      }
    });

    socket.on("reset", async () => {
      try {
        requireInstructor(socket);
        state = resetSeating(state);
        await persistState(state);
        emitState();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not reset the table.";
        socket.emit("error-message", message);
      }
    });

    socket.on("disconnect", () => {
      socket.broadcast.emit("presence", { connectedCount: Math.max(0, io.engine.clientsCount) });
    });
  });

  httpServer.on("error", (error) => {
    console.error("Classroom server failed:", error);
    process.exitCode = 1;
  });

  httpServer.listen(PORT, () => {
    console.log(`DDA1000 CAT listening on http://localhost:${PORT}`);
  });
}

main().catch((error) => {
  console.error("Failed to start classroom server:", error);
  process.exit(1);
});
