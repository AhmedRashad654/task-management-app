import z from "zod";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const addMemberSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});


export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
export type ProjectFormValues = z.infer<typeof projectFormSchema>;
