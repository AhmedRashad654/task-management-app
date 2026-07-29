import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMembers, useAddMember, useRemoveMember } from "../hooks/member-hooks";
import AddMemberDialog from "./AddMemberDialog";
import RemoveMemberDialog from "./RemoveMemberDialog";

type MembersTabProps = {
  projectId: string;
  isOwner: boolean;
};

const MembersTab = ({ projectId, isOwner }: MembersTabProps) => {
  const { data, isLoading } = useMembers(projectId);
  const addMutation = useAddMember(projectId);
  const removeMutation = useRemoveMember(projectId);

  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  const owner = data?.data?.owner;
  const members = data?.data?.members ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border border-border p-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {isOwner && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="size-4" />
            Add member
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              {isOwner && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {owner && (
              <tr className="border-b border-border bg-muted/20">
                <td className="px-4 py-3 font-medium">{owner.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{owner.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    owner
                  </span>
                </td>
                {isOwner && <td className="px-4 py-3" />}
              </tr>
            )}
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/30"
              >
                <td className="px-4 py-3 font-medium">{member.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    member
                  </span>
                </td>
                {isOwner && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        setRemoveTarget({ id: member.id, name: member.name })
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddMemberDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(email) => {
          addMutation.mutate(email, {
            onSuccess: () => setAddOpen(false),
          });
        }}
        isPending={addMutation.isPending}
      />

      {removeTarget && (
        <RemoveMemberDialog
          open={!!removeTarget}
          onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
          onConfirm={() => {
            removeMutation.mutate(removeTarget.id, {
              onSuccess: () => setRemoveTarget(null),
            });
          }}
          isPending={removeMutation.isPending}
          memberName={removeTarget.name}
        />
      )}
    </div>
  );
};

export default MembersTab;
