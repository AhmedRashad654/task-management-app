import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project-api";
import type { CreateProjectPayload, UpdateProjectPayload } from "../types";

export const projectsQueryKey = ["projects"] as const;
export const projectQueryKey = (id: string) => ["projects", id] as const;

export const useProjects = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...projectsQueryKey, { page, limit }],
    queryFn: () => getProjects(page, limit),
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: projectQueryKey(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
};

export const useUpdateProject = () => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateProjectPayload) =>
      updateProject(id, payload),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
};

export const useDeleteProject = () => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: projectsQueryKey });
    },
  });
};
