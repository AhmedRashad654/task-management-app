import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TasksGateway } from './tasks.gateway.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { QueryTasksDto } from './dto/query-tasks.dto.js';
import { TASK_MESSAGES } from '../common/constants/messages.constant.js';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasksGateway: TasksGateway,
  ) {}

  async create(projectId: string, userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        dueDate: dto.dueDate,
        assigneeId: dto.assigneeId,
        projectId,
        creatorId: userId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return task;
  }

  async findAll(projectId: string, query: QueryTasksDto) {
    const { status, priority, assigneeId, page, limit } = query;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    const where: any = { projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: page ?? 1,
        limit: limit ?? 10,
        totalPages: Math.ceil(total / (limit ?? 10)),
      },
    };
  }

  async findOne(projectId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task || task.projectId !== projectId) {
      throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
    }

    return task;
  }

  async update(
    taskId: string,
    dto: UpdateTaskDto,
  ) {
    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return updated;
  }

  async updateStatus(
    projectId: string,
    taskId: string,
    userId: string,
    dto: UpdateStatusDto,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, projectId: true, status: true },
    });

    if (!task || task.projectId !== projectId) {
      throw new NotFoundException(TASK_MESSAGES.NOT_FOUND);
    }

    const oldStatus = task.status;
    const newStatus = dto.status;

    if (oldStatus === newStatus) {
      return this.findOne(projectId, taskId);
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: { status: newStatus },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.taskStatusLog.create({
        data: {
          taskId,
          changedBy: userId,
          oldStatus,
          newStatus,
        },
      }),
    ]);

    this.tasksGateway.emitTaskStatusChanged(projectId, {
      taskId,
      oldStatus: oldStatus.toString(),
      newStatus: newStatus.toString(),
      changedBy: userId,
      timestamp: new Date(),
    });

    return updated;
  }

  async delete(taskId: string,) {
    await this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
