import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { ensureSocket } from "@/api/socket";
import type { InfiniteData } from "@tanstack/react-query";
import type { OrderSummary } from "../types";
import { useActiveRestaurantStore } from "@/store/active-restaurant-store";
import { RESTAURANT_ROLES } from "@/features/restaurant/types";
import { SYSTEM_ROLES } from "@/features/auth/types";

interface StatusPayload {
  publicId: string;
  status: string;
}

type OrdersPage = { data: OrderSummary[] };
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

function patchStatus(
  oldData: InfiniteData<OrdersPage> | undefined,
  publicId: string,
  status: string,
): InfiniteData<OrdersPage> | undefined {
  if (!oldData?.pages) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((order) =>
        order.public_id === publicId ? { ...order, status } : order,
      ),
    })),
  };
}

export function useRestaurantOrderEvents(
  branchId: number | null,
  restaurantId: number | null,
) {
  const queryClient = useQueryClient();
  const roleActiveRestaurant = useActiveRestaurantStore(
    (s) => s.activeRestaurant?.restaurantRole,
  );
  const token = useAuthStore((s) => s.accessToken);
  useEffect(() => {
    if (!branchId || !token) return;

    const socket = ensureSocket(token);
    const channel =
      roleActiveRestaurant === RESTAURANT_ROLES.OWNER
        ? `restaurant:${restaurantId}`
        : `branch:${branchId}`;

    const handleConnect = () => {
      socket.emit("subscribe", channel);
    };

    const handleOrderCreated = () => {
      queryClient.invalidateQueries({
        queryKey: ["branch", branchId, "orders"],
      });
    };

    const handleStatusUpdated = (payload: StatusPayload) => {
      queryClient.setQueriesData<InfiniteData<OrdersPage>>(
        { queryKey: ["branch", branchId, "orders"] },
        (oldData) => patchStatus(oldData, payload.publicId, payload.status),
      );
    };

    const handleOrderExhausted = (payload: StatusPayload) => {
      queryClient.setQueriesData<InfiniteData<OrdersPage>>(
        { queryKey: ["branch", branchId, "orders"] },
        (oldData) => patchStatus(oldData, payload.publicId, payload.status),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("order.created", handleOrderCreated);
    socket.on("order.status.updated", handleStatusUpdated);
    socket.on("assignment.exhausted", handleOrderExhausted);

    if (socket.connected) {
      socket.emit("subscribe", channel);
    }

    return () => {
      socket.emit("unsubscribe", channel);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("order.created", handleOrderCreated);
      socket.off("order.status.updated", handleStatusUpdated);
      socket.off("assignment.exhausted", handleOrderExhausted);
    };
  }, [token, queryClient, branchId, roleActiveRestaurant, restaurantId]);
}

export function useCustomerOrderEvents() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = ensureSocket(token);
    const channel = `customer:${user.id}`;

    const handleConnect = () => {
      socket.emit("subscribe", channel);
    };

    const handleStatusUpdated = (payload: StatusPayload) => {
      queryClient.setQueriesData<InfiniteData<OrdersPage>>(
        { queryKey: ["orders", "customer"] },
        (oldData) => patchStatus(oldData, payload.publicId, payload.status),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("order.status.updated", handleStatusUpdated);
    socket.on("connect_error", handleConnectError);
    if (socket.connected) {
      socket.emit("subscribe", channel);
    }

    return () => {
      socket.emit("unsubscribe", channel);
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("order.status.updated", handleStatusUpdated);
    };
  }, [user?.id, token, queryClient]);
}

export function useOrderStatusEvents(publicId: string | undefined) {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const activeBranchId = useActiveRestaurantStore(
    (s) => s.activeBranch?.branchId ?? null,
  );
  const activeRestaurantId = useActiveRestaurantStore(
    (s) => s.activeRestaurant?.restaurantId ?? null,
  );
  const role = useActiveRestaurantStore(
    (s) => s.activeRestaurant?.restaurantRole,
  );

  useEffect(() => {
    if (!user?.id || !token || !publicId) return;

    const socket = ensureSocket(token);
    const channel =
      user.system_role === SYSTEM_ROLES.RESTAURANT_USER
        ? role === RESTAURANT_ROLES.OWNER
          ? `restaurant:${activeRestaurantId}`
          : `branch:${activeBranchId}`
        : `customer:${user.id}`;

    const handleStatusUpdated = (payload: StatusPayload) => {
      if (payload.publicId !== publicId) return;
      queryClient.invalidateQueries({
        queryKey: ["orders", publicId],
      });
    };

    socket.on("connect", () => socket.emit("subscribe", channel));
    socket.on("order.status.updated", handleStatusUpdated);
    socket.on("connect_error", handleConnectError);
    if (socket.connected) socket.emit("subscribe", channel);

    return () => {
      socket.emit("unsubscribe", channel);
      socket.off("order.status.updated", handleStatusUpdated);
      socket.off("connect_error", handleConnectError);
    };
  }, [
    activeBranchId,
    activeRestaurantId,
    publicId,
    queryClient,
    role,
    token,
    user,
  ]);
}
