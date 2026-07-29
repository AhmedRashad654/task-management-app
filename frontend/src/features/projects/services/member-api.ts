import { type ApiResponse } from "@/api/api-helper";
import { apiClient } from "@/api/axios-client";
import type { MembersResponse } from "../types";

export const getMembers = async (projectId: string) => {
  const response = await apiClient.get<ApiResponse<MembersResponse>>(
    `/projects/${projectId}/members`,
  );
  return response.data;
};

export const addMember = async (projectId: string, email: string) => {
  const response = await apiClient.post<ApiResponse<void>>(
    `/projects/${projectId}/members`,
    { email },
  );
  return response.data;
};

export const removeMember = async (projectId: string, memberId: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/projects/${projectId}/members/${memberId}`,
  );
  return response.data;
};
