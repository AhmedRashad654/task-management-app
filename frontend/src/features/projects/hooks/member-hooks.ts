import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMembers, addMember, removeMember } from "../services/member-api";

const membersQueryKey = (projectId: string) => ["members", projectId] as const;

export const useMembers = (projectId: string) => {
  return useQuery({
    queryKey: membersQueryKey(projectId),
    queryFn: () => getMembers(projectId),
    enabled: !!projectId,
  });
};

export const useAddMember = (projectId: string) => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => addMember(projectId, email),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: membersQueryKey(projectId) });
    },
  });
};

export const useRemoveMember = (projectId: string) => {
  const qC = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(projectId, memberId),
    onSuccess: () => {
      qC.invalidateQueries({ queryKey: membersQueryKey(projectId) });
    },
  });
};
