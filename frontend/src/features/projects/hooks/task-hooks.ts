import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../services/task-api";
import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskQueryParams,
} from "../types";

export const tasksQueryKey = (projectId: string, params: TaskQueryParams) =>
  ["tasks", projectId, params] as const;
export const taskQueryKey = (projectId: string, taskId: string) =>
  ["tasks", projectId, taskId] as const;

export const useTasks = (projectId: string, params: TaskQueryParams) => {
  return useQuery({
    queryKey: tasksQueryKey(projectId, params),
    queryFn: () => getTasks(projectId, params),
    enabled: !!projectId,
  });
};

export const useTask = (projectId: string, taskId: string) => {
  return useQuery({
    queryKey: taskQueryKey(projectId, taskId),
    queryFn: () => getTask(projectId, taskId),
    enabled: !!projectId && !!taskId,
  });
};

export const useCreateTask = (projectId: string) => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(projectId, payload),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

export const useUpdateTask = (projectId: string) => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      ...payload
    }: { taskId: string } & UpdateTaskPayload) =>
      updateTask(projectId, taskId, payload),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

export const useUpdateTaskStatus = (projectId: string) => {
  // const qC = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      updateTaskStatus(projectId, taskId, status),
    onSuccess: () => {
      // qC.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};

export const useDeleteTask = (projectId: string) => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
};
