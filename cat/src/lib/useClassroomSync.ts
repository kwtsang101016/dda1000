import { io, type Socket } from "socket.io-client";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_STATE } from "../../shared/seating.ts";
import type {
  ClassroomState,
  PersonProfile,
  SeatRef,
  ServerSnapshot,
} from "../../shared/types.ts";

type ConnectionStatus = "connecting" | "live" | "reconnecting" | "offline";

interface ClassroomSync {
  state: ClassroomState;
  connectedCount: number;
  status: ConnectionStatus;
  errorMessage: string | null;
  clearError: () => void;
  place: (personId: string, target: SeatRef) => void;
  unseat: (personId: string) => void;
  setLayout: (studentRowCount: number, seatsPerRow: number) => void;
  updateProfile: (personId: string, profile: PersonProfile) => void;
  reset: () => void;
}

export function useClassroomSync(): ClassroomSync {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<ClassroomState>(DEFAULT_STATE);
  const [connectedCount, setConnectedCount] = useState(1);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

    socket.on("connect", () => {
      setStatus("live");
      setErrorMessage(null);
    });
    socket.on("disconnect", () => {
      setStatus("reconnecting");
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
      clearError: () => setErrorMessage(null),
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
    }),
    [connectedCount, errorMessage, state, status],
  );
}
