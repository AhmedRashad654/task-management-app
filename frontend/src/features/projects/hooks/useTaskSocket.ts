import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { ensureSocket } from "@/api/socket";
import type { UpdateTaskStatusPayload } from "../types";

let isRefreshing = false;
const handleConnectError = async (err: Error) => {
  if (err.message === "Invalid or expired token") {
    if (isRefreshing) return;
    isRefreshing = true;

    try {
      const { centralRefresh } = await import("@/api/axios-client");
      const { destroySocket } = await import("@/api/socket");
      const accessToken = await centralRefresh();

      destroySocket();
      ensureSocket(accessToken);
    } catch {
      useAuthStore.getState().clearSession();
    } finally {
      isRefreshing = false;
    }
  }
};

export const useTaskSocket = (projectId: string | undefined) => {
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId || !token) return;

    const socket = ensureSocket(token);

    const handleConnect = () => {};

    const handleSubscribe = () => {
      socket.emit("subscribe", projectId);
    };

    const handleStatusChanged = (payload: UpdateTaskStatusPayload) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({
        queryKey: ["tasks", projectId, payload.taskId],
      });
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("task.status.changed", handleStatusChanged);
    socket.on("hello", handleSubscribe);

    if (socket.connected) {
      socket.emit("subscribe", projectId);
    }

    return () => {
      socket.emit("unsubscribe", projectId);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("task.status.changed", handleStatusChanged);
    };
  }, [projectId, token, queryClient]);
};
