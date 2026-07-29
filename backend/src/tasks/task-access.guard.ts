import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service.js';
import { TASK_ACTION_KEY, TaskActionType } from './decorators/task-action.decorator.js';
import { TASK_MESSAGES } from '../common/constants/messages.constant.js';

@Injectable()
export class TaskAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<TaskActionType>(
      TASK_ACTION_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const taskId = request.params?.taskId;
    const projectId = request.params?.projectId || request.params?.id;

    if (!userId || !taskId || !projectId) {
      throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
    }

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { creatorId: true, assigneeId: true, projectId: true },
    });

    if (!task || task.projectId !== projectId) {
      throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    const isOwner = project?.ownerId === userId;
    const isCreator = task.creatorId === userId;
    const isAssignee = task.assigneeId === userId;

    if (isOwner) return true;

    switch (action) {
      case 'update_status':
        if (isCreator || isAssignee) return true;
        break;
      case 'update':
      case 'delete':
        if (isCreator) return true;
        break;
    }

    throw new ForbiddenException('You do not have permission to perform this action');
  }
}
