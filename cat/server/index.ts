import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import {
  DEFAULT_STATE,
  isClassroomState,
  isSeatRef,
  normalizeLoadedState,
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
const stateDir = path.join(rootDir, "data");
const statePath = path.join(stateDir, "state.json");
const rosterPath = path.join(rootDir, "src", "data", "roster.json");
const distDir = path.join(rootDir, "dist");
const PORT = Number(process.env.PORT) || 3001;

let state: ClassroomState = DEFAULT_STATE;
let personIds = new Set<string>();

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

async function loadState(): Promise<ClassroomState> {
  try {
    const raw = await readFile(statePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!isClassroomState(parsed)) {
      console.warn("Stored classroom state was invalid; using defaults.");
      return DEFAULT_STATE;
    }
    return normalizeLoadedState(parsed);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.warn("Could not read classroom state file:", error);
    }
    return DEFAULT_STATE;
  }
}

async function persistState(next: ClassroomState): Promise<void> {
  try {
    await mkdir(stateDir, { recursive: true });
    await writeFile(statePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  } catch (error) {
    console.error("Failed to persist classroom state:", error);
  }
}

function snapshot(connectedCount: number): ServerSnapshot {
  return { state, connectedCount };
}

async function main(): Promise<void> {
  const roster = await loadRoster();
  personIds = new Set(roster.people.map((person) => person.id));
  state = await loadState();

  const app = express();
  app.disable("x-powered-by");
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "250kb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, course: roster.course, section: roster.section });
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
    socket.emit("snapshot", snapshot(io.engine.clientsCount));
    socket.broadcast.emit("presence", { connectedCount: io.engine.clientsCount });

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
