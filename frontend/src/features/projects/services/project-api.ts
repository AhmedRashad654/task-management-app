import { type ApiResponse } from "@/api/api-helper";
import { apiClient } from "@/api/axios-client";
import type { Project, CreateProjectPayload, UpdateProjectPayload } from "../types";

export const getProjects = async (page = 1, limit = 10) => {
  const response = await apiClient.get<ApiResponse<Project[]>>("/projects", {
    params: { page, limit },
  });
  return response.data;
};

export const getProject = async (id: string) => {
  const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data;
};

export const createProject = async (payload: CreateProjectPayload) => {
  const response = await apiClient.post<ApiResponse<Project>>("/projects", payload);
  return response.data;
};

export const updateProject = async (id: string, payload: UpdateProjectPayload) => {
  const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(`/projects/${id}`);
  return response.data;
};
