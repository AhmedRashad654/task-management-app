import { type ApiResponse } from "@/api/api-helper";
import type {
  AuthResponseData,
  AuthUser,
  ForgotPasswordPayload,
  LoginPayload,
  RefreshResponseData,
  RegisterPayload,
  ResetPasswordPayload,
} from "../types";
import { apiClient } from "@/api/axios-client";

export const login = async (payload: LoginPayload) => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    "/auth/login",
    payload,
  );
  return response.data;
};

export const register = async (payload: RegisterPayload) => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    "/auth/register",
    payload,
  );
  return response.data;
};

export const refreshToken = async () => {
  const response = await apiClient.post<ApiResponse<RefreshResponseData>>(
    "/auth/refresh",
  );
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/logout",
  );
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/users/me");
  return response.data;
};

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/forgot-password",
    payload,
  );
  return response.data;
};

export const resetPassword = async (payload: ResetPasswordPayload) => {
  const response = await apiClient.post<ApiResponse<{ message: string }>>(
    "/auth/reset-password",
    payload,
  );
  return response.data;
};
