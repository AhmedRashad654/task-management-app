import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TaskStatus } from "../types";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

type UpdateStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: TaskStatus;
  onConfirm: (status: TaskStatus) => void;
  isPending: boolean;
};

const UpdateStatusDialog = ({
  open,
  onOpenChange,
  currentStatus,
  onConfirm,
  isPending,
}: UpdateStatusDialogProps) => {
  const [selected, setSelected] = useState<TaskStatus>(currentStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update status</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-left transition-colors ${
                  selected === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
                onClick={() => setSelected(opt.value)}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    selected === opt.value
                      ? "border-primary bg-primary"
                      : "border-muted-foreground"
                  }`}
                >
                  {selected === opt.value && (
                    <span className="size-2 rounded-full bg-white" />
                  )}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selected)}
            disabled={isPending || selected === currentStatus}
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;
