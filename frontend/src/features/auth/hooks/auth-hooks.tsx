import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
} from "../services/auth-api";

export const useLogin = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
      setAccessToken(response.data.accessToken);
      const meResponse = await getMe();
      setUser(meResponse.data);
    },
  });
};

export const useRegister = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: register,
    onSuccess: async (response) => {
      setAccessToken(response.data.accessToken);
      const meResponse = await getMe();
      setUser(meResponse.data);
    },
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);
  const qC = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession();
      qC.clear();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
  });
};
