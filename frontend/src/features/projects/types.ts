export type Project = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  _count: { members: number; tasks: number };
  role: "owner" | "member";
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectPayload = {
  name: string;
  description?: string;
};

export type UpdateProjectPayload = {
  name?: string;
  description?: string;
};

export type Member = {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Owner = {
  id: string;
  name: string;
  email: string;
};

export type MembersResponse = {
  owner: Owner;
  members: Member[];
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  creatorId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; name: string; email: string };
  assignee: { id: string; name: string; email: string } | null;
  statusLogs?: TaskStatusLogEntry[];
};

export type TaskStatusLogEntry = {
  id: string;
  taskId: string;
  changedBy: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
};

export type UpdateTaskStatusPayload = {
  taskId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  timestamp: Date;
};

export type TaskQueryParams = {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  page?: number;
  limit?: number;
};
