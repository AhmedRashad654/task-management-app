import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import type { CreateTaskPayload, Member, Owner } from "../types";
import { useEffect } from "react";
import { taskFormSchema, type TaskFormValues } from "../schemas";



type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateTaskPayload) => void;
  isPending: boolean;
  title: string;
  submitLabel: string;
  defaultValues?: Partial<TaskFormValues>;
  members: Member[];
  owner?:Owner
};

const TaskFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  title: dialogTitle,
  submitLabel,
  defaultValues,
  members,
  owner
}: TaskFormDialogProps) => {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: "", description: "", priority: "MEDIUM", dueDate: "", assigneeId: "", ...defaultValues },
  });

  const handleSubmit = (values: TaskFormValues) => {
    const payload: CreateTaskPayload = {
      title: values.title,
    };
    if (values.description) payload.description = values.description;
    if (values.priority) payload.priority = values.priority;
    if (values.dueDate) payload.dueDate = values.dueDate;
    if (values.assigneeId) payload.assigneeId = values.assigneeId;
    onSubmit(payload);
  };


  useEffect(()=>{
     form.reset()
  },[form,open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="task-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="task-title"
                    placeholder="Task title"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="task-desc">Description</FieldLabel>
                  <Input
                    {...field}
                    id="task-desc"
                    placeholder="Optional description"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
                  <select
                    id="task-priority"
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    value={field.value ?? "MEDIUM"}
                    onChange={field.onChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="task-due">Due date</FieldLabel>
                  <Input
                    {...field}
                    id="task-due"
                    type="date"
                  />
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="task-assignee">Assignee</FieldLabel>
                  <select
                    id="task-assignee"
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  >
                    <option value="">Unassigned</option>
                    {owner && (
                      <option value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    )}
                    {members.map((m) => (
                      <option key={m.id} value={m.userId}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" disabled={isPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
