import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useTask } from "../hooks/task-hooks";
import type { TaskStatusLogEntry } from "../types";

type HistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  taskId: string;
};

const statusLabel: Record<string, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const HistoryDialog = ({
  open,
  onOpenChange,
  projectId,
  taskId,
}: HistoryDialogProps) => {
  const { data, isLoading } = useTask(projectId, taskId);
  const task = data?.data;
  const logs: TaskStatusLogEntry[] = task?.statusLogs ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Status history</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No status changes yet.</p>
          ) : (
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border" />
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <span className="absolute -left-4 top-1.5 size-2 rounded-full bg-muted-foreground/40" />
                    <div className="text-sm">
                      <span className="font-medium">{log.user.name}</span>{" "}
                      changed status from{" "}
                      <span className="font-medium">{statusLabel[log.oldStatus] ?? log.oldStatus}</span>{" "}
                      to{" "}
                      <span className="font-medium">{statusLabel[log.newStatus] ?? log.newStatus}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryDialog;
