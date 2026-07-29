import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "");
}

function createConnection(token: string): Socket {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
  }

  socket = io(getBaseUrl(), {
    path: "/ws",
    auth: { token: token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

export function ensureSocket(token: string): Socket {
  if (socket && (socket.connected || socket.active)) {
    return socket;
  }
  return createConnection(token);
}

export function destroySocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
