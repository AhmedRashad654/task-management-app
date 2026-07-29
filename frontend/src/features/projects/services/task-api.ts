import { type ApiResponse } from "@/api/api-helper";
import { apiClient } from "@/api/axios-client";
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskQueryParams } from "../types";

export const getTasks = async (projectId: string, params: TaskQueryParams) => {
  const response = await apiClient.get<ApiResponse<Task[]>>(
    `/projects/${projectId}/tasks`,
    { params },
  );
  return response.data;
};

export const getTask = async (projectId: string, taskId: string) => {
  const response = await apiClient.get<ApiResponse<Task>>(
    `/projects/${projectId}/tasks/${taskId}`,
  );
  return response.data;
};

export const createTask = async (projectId: string, payload: CreateTaskPayload) => {
  const response = await apiClient.post<ApiResponse<Task>>(
    `/projects/${projectId}/tasks`,
    payload,
  );
  return response.data;
};

export const updateTask = async (
  projectId: string,
  taskId: string,
  payload: UpdateTaskPayload,
) => {
  const response = await apiClient.patch<ApiResponse<Task>>(
    `/projects/${projectId}/tasks/${taskId}`,
    payload,
  );
  return response.data;
};

export const updateTaskStatus = async (
  projectId: string,
  taskId: string,
  status: string,
) => {
  const response = await apiClient.patch<ApiResponse<Task>>(
    `/projects/${projectId}/tasks/${taskId}/status`,
    { status },
  );
  return response.data;
};

export const deleteTask = async (projectId: string, taskId: string) => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/projects/${projectId}/tasks/${taskId}`,
  );
  return response.data;
};
