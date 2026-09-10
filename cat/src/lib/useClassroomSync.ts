import { io, type Socket } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_STATE } from "../../shared/seating.ts";
import type {
  ClassroomState,
  PersonProfile,
  SeatRef,
  ServerSnapshot,
} from "../../shared/types.ts";
import { loadAuthSession } from "./authSession.ts";

type ConnectionStatus = "connecting" | "live" | "reconnecting" | "offline";

interface ClassroomSync {
  state: ClassroomState;
  connectedCount: number;
  status: ConnectionStatus;
  errorMessage: string | null;
  isInstructor: boolean;
  authorizedIds: Set<string>;
  clearError: () => void;
  authorize: (payload: {
    personId?: string;
    secret: string;
    asInstructor: boolean;
  }) => Promise<void>;
  place: (personId: string, target: SeatRef) => void;
  unseat: (personId: string) => void;
  setLayout: (studentRowCount: number, seatsPerRow: number) => void;
  updateProfile: (personId: string, profile: PersonProfile) => void;
  reset: () => void;
  canControl: (personId: string) => boolean;
}

export function useClassroomSync(): ClassroomSync {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<ClassroomState>(DEFAULT_STATE);
  const [connectedCount, setConnectedCount] = useState(1);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInstructor, setIsInstructor] = useState(false);
  const [authorizedIds, setAuthorizedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 400,
      reconnectionDelayMax: 2000,
    });
    socketRef.current = socket;

    const onSnapshot = (snapshot: ServerSnapshot) => {
      setState({
        ...snapshot.state,
        profiles: snapshot.state.profiles ?? {},
      });
      setConnectedCount(snapshot.connectedCount);
      setStatus("live");
    };

    const restoreSession = () => {
      const session = loadAuthSession();
      if (session.instructorSecret) {
        socket.emit("authorize", {
          secret: session.instructorSecret,
          asInstructor: true,
        });
      }
      for (const [personId, secret] of Object.entries(session.secrets)) {
        socket.emit("authorize", { personId, secret, asInstructor: false });
      }
    };

    socket.on("connect", () => {
      setStatus("live");
      setErrorMessage(null);
      restoreSession();
    });
    socket.on("disconnect", () => {
      setStatus("reconnecting");
      setIsInstructor(false);
      setAuthorizedIds(new Set());
    });
    socket.on("connect_error", () => {
      setStatus((current) => (current === "live" ? "reconnecting" : "offline"));
    });
    socket.on("snapshot", onSnapshot);
    socket.on("presence", (payload: { connectedCount: number }) => {
      setConnectedCount(payload.connectedCount);
    });
    socket.on("error-message", (message: string) => {
      setErrorMessage(message);
    });
    socket.on(
      "auth-state",
      (payload: { isInstructor: boolean; authorizedIds: string[] }) => {
        setIsInstructor(Boolean(payload.isInstructor));
        setAuthorizedIds(new Set(payload.authorizedIds ?? []));
      },
    );

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return useMemo(
    () => ({
      state,
      connectedCount,
      status,
      errorMessage,
      isInstructor,
      authorizedIds,
      clearError: () => setErrorMessage(null),
      authorize: ({ personId, secret, asInstructor }) =>
        new Promise<void>((resolve, reject) => {
          const socket = socketRef.current;
          if (!socket) {
            reject(new Error("Not connected."));
            return;
          }
          socket
            .timeout(8000)
            .emit(
              "authorize",
              { personId, secret, asInstructor },
              (error: Error | null, response?: { ok: boolean; message?: string }) => {
                if (error) {
                  reject(error);
                  return;
                }
                if (!response?.ok) {
                  reject(new Error(response?.message || "Verification failed."));
                  return;
                }
                resolve();
              },
            );
        }),
      place: (personId, target) => {
        socketRef.current?.emit("place", { personId, target });
      },
      unseat: (personId) => {
        socketRef.current?.emit("unseat", { personId });
      },
      setLayout: (studentRowCount, seatsPerRow) => {
        socketRef.current?.emit("setLayout", { studentRowCount, seatsPerRow });
      },
      updateProfile: (personId, profile) => {
        socketRef.current?.emit("updateProfile", { personId, profile });
      },
      reset: () => {
        socketRef.current?.emit("reset");
      },
      canControl: (personId: string) => isInstructor || authorizedIds.has(personId),
    }),
    [authorizedIds, connectedCount, errorMessage, isInstructor, state, status],
  );
}
