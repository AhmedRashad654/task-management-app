import { useState } from "react";
import { Plus, History, Trash2, Edit, Bolt } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomSkeletonTable from "@/components/ui/custom-skeleton-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useTasks, useCreateTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from "../hooks/task-hooks";
import { useTaskSocket } from "../hooks/useTaskSocket";
import { useMembers } from "../hooks/member-hooks";
import TaskFormDialog from "./TaskFormDialog";
import UpdateStatusDialog from "./UpdateStatusDialog";
import DeleteTaskConfirmDialog from "./DeleteTaskConfirmDialog";
import HistoryDialog from "./HistoryDialog";
import type { Task, TaskQueryParams } from "../types";

const statusLabel: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const statusColor: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const priorityColor: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-500",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

type TasksTabProps = {
  projectId: string;
  isOwner: boolean;
  userId: string;
};

const TasksTab = ({ projectId, isOwner, userId }: TasksTabProps) => {
  useTaskSocket(projectId);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TaskQueryParams>({ page: 1, limit: 10 });

  const { data: tasksData, isLoading } = useTasks(projectId, filters);
  const { data: membersData } = useMembers(projectId);
  const createMutation = useCreateTask(projectId);
  const updateMutation = useUpdateTask(projectId);
  const statusMutation = useUpdateTaskStatus(projectId);
  const deleteMutation = useDeleteTask(projectId);

  const tasks = tasksData?.data ?? [];
  const meta = tasksData?.meta;
  const totalPages = meta?.totalPages ?? 1;
  const members = membersData?.data?.members ?? [];
  const owner = membersData?.data?.owner
  
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [statusTarget, setStatusTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [historyTarget, setHistoryTarget] = useState<{ taskId: string; title: string } | null>(null);

  const canEdit = (task: Task) => isOwner || task.creatorId === userId;
  const canDelete = (task: Task) => isOwner || task.creatorId === userId;
  const canUpdateStatus = (task: Task) => isOwner || task.creatorId === userId || task.assigneeId === userId;

  const handleFilterChange = (key: keyof TaskQueryParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
            value={filters.status ?? ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
            value={filters.priority ?? ""}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
            value={filters.assigneeId ?? ""}
            onChange={(e) => handleFilterChange("assigneeId", e.target.value)}
          >
            <option value="">All assignees</option>
            {owner && (
              <option value={owner.id}>
                {owner.name}
              </option>
            )}
            {members.map((m) => (
              <option key={m.id} value={m.userId}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New task
        </Button>
      </div>

      {isLoading ? (
        <CustomSkeletonTable />
      ) : tasks.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">No tasks found.</div>
      ) : (
        <div className="overflow-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assignee</th>
                <th className="px-4 py-3 font-medium">Due date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/30"
                >
                  <td className="max-w-xs truncate px-4 py-3 font-medium">
                    {task.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        priorityColor[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium  whitespace-nowrap ${
                        statusColor[task.status]
                      }`}
                    >
                      {statusLabel[task.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {task.assignee?.name ?? "Unassigned"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canUpdateStatus(task) && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setStatusTarget(task)}
                          title="Update status"
                        >
                          <Bolt  className="size-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          setHistoryTarget({ taskId: task.id, title: task.title })
                        }
                        title="Status history"
                      >
                        <History className="size-3" />
                      </Button>
                      {canEdit(task) && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setEditTarget(task)}
                          title="Edit task"
                        >
                          <Edit className="size-3" />
                        </Button>
                      )}
                      {canDelete(task) && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeleteTarget(task)}
                          title="Delete task"
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && tasks.length > 0 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  const next = Math.max(1, page - 1);
                  setPage(next);
                  setFilters((prev) => ({ ...prev, page: next }));
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  onClick={() => {
                    setPage(p);
                    setFilters((prev) => ({ ...prev, page: p }));
                  }}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  const next = Math.min(totalPages, page + 1);
                  setPage(next);
                  setFilters((prev) => ({ ...prev, page: next }));
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create task"
        submitLabel="Create"
        members={members}
         owner={owner}
        onSubmit={(values) => {
          createMutation.mutate(values, {
            onSuccess: () => setCreateOpen(false),
          });
        }}
        isPending={createMutation.isPending}
      />

      {editTarget && (
        <TaskFormDialog
          key={`edit-${editTarget.id}`}
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          title="Edit task"
          submitLabel="Save"
          members={members}
          owner={owner}
          defaultValues={{
            title: editTarget.title,
            description: editTarget.description ?? "",
            priority: editTarget.priority,
            dueDate: editTarget.dueDate ? editTarget.dueDate.split("T")[0] : "",
            assigneeId: editTarget.assigneeId ?? "",
          }}
          onSubmit={(values) => {
            updateMutation.mutate(
              { taskId: editTarget.id, ...values },
              { onSuccess: () => setEditTarget(null) },
            );
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {statusTarget && (
        <UpdateStatusDialog
          open={!!statusTarget}
          onOpenChange={(open) => { if (!open) setStatusTarget(null); }}
          currentStatus={statusTarget.status}
          onConfirm={(status) => {
            statusMutation.mutate(
              { taskId: statusTarget.id, status },
              { onSuccess: () => setStatusTarget(null) },
            );
          }}
          isPending={statusMutation.isPending}
        />
      )}

      {deleteTarget && (
        <DeleteTaskConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
          onConfirm={() => {
            deleteMutation.mutate(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }}
          isPending={deleteMutation.isPending}
          taskTitle={deleteTarget.title}
        />
      )}

      {historyTarget && (
        <HistoryDialog
          open={!!historyTarget}
          onOpenChange={(open) => { if (!open) setHistoryTarget(null); }}
          projectId={projectId}
          taskId={historyTarget.taskId}
        />
      )}
    </div>
  );
};

export default TasksTab;
