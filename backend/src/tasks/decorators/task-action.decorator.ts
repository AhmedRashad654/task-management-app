import { SetMetadata } from '@nestjs/common';

export const TASK_ACTION_KEY = 'task_action';
export type TaskActionType = 'update' | 'update_status' | 'delete';

export const TaskAction = (action: TaskActionType) =>
  SetMetadata(TASK_ACTION_KEY, action);
