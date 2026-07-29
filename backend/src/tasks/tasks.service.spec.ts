import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { TasksGateway } from './tasks.gateway.js';
import { TasksService } from './tasks.service.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { TASK_MESSAGES } from '../common/constants/messages.constant.js';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: any;
  let gateway: any;

  const mockPrisma = {
    task: {
      findUnique: jest.fn<any>(),
      findMany: jest.fn<any>(),
      create: jest.fn<any>(),
      update: jest.fn<any>(),
      delete: jest.fn<any>(),
      count: jest.fn<any>(),
    },
    taskStatusLog: {
      create: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  };

  const mockGateway = {
    emitTaskStatusChanged: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TasksGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);
    gateway = module.get(TasksGateway);
  });

  afterEach(() => jest.clearAllMocks());

  describe('updateStatus', () => {
    const projectId = 'project-1';
    const taskId = 'task-1';
    const userId = 'user-1';
    const dto = { status: 'IN_PROGRESS' } as UpdateStatusDto;

    const existingTask = {
      id: taskId,
      projectId,
      status: 'TODO',
    };

    const updatedTask = {
      id: taskId,
      projectId,
      status: 'IN_PROGRESS',
      creator: { id: 'creator-id', name: 'Creator', email: 'c@t.com' },
      assignee: null,
    };

    it('should create a TaskStatusLog when status changes', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(existingTask);
      mockPrisma.$transaction.mockImplementation(async (actions: any) =>
        Array.isArray(actions) ? Promise.all(actions) : actions,
      );
      mockPrisma.task.update.mockResolvedValue(updatedTask);
      mockPrisma.taskStatusLog.create.mockResolvedValue({});

      const result = await service.updateStatus(projectId, taskId, userId, dto);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        select: { id: true, projectId: true, status: true },
      });
      expect(prisma.taskStatusLog.create).toHaveBeenCalledWith({
        data: {
          taskId,
          changedBy: userId,
          oldStatus: 'TODO',
          newStatus: 'IN_PROGRESS',
        },
      });
      expect(gateway.emitTaskStatusChanged).toHaveBeenCalledWith(projectId, {
        taskId,
        oldStatus: 'TODO',
        newStatus: 'IN_PROGRESS',
        changedBy: userId,
        timestamp: expect.any(Date),
      });
      expect(result.status).toBe('IN_PROGRESS');
      expect(prisma.$transaction).toHaveBeenCalled();
    });


    it('should throw NotFoundException for task not in project', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        ...existingTask,
        projectId: 'other-project',
      });

      await expect(
        service.updateStatus(projectId, taskId, userId, dto),
      ).rejects.toThrow(TASK_MESSAGES.NOT_FOUND);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId },
        select: { id: true, projectId: true, status: true },
      });
    });
  });

  describe('findAll', () => {
    const projectId = 'project-1';
    const tasks = [
      {
        id: 'task-1',
        title: 'Task A',
        status: 'TODO',
        priority: 'HIGH',
        creator: { id: 'c1', name: 'C1', email: 'c1@t.com' },
        assignee: null,
      },
      {
        id: 'task-2',
        title: 'Task B',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        creator: { id: 'c2', name: 'C2', email: 'c2@t.com' },
        assignee: null,
      },
    ];

    it('should return paginated tasks with correct meta', async () => {
      mockPrisma.$transaction.mockImplementation(async (args: any[]) =>
        Promise.all(args),
      );
      mockPrisma.task.findMany.mockResolvedValue(tasks);
      mockPrisma.task.count.mockResolvedValue(2);

      const result = await service.findAll(projectId, {
        page: 1,
        limit: 10,
      });

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { projectId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(prisma.task.count).toHaveBeenCalledWith({
        where: { projectId },
      });
      expect(result.items).toHaveLength(2);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter tasks by status', async () => {
      mockPrisma.$transaction.mockImplementation(async (args: any[]) =>
        Promise.all(args),
      );
      mockPrisma.task.findMany.mockResolvedValue([tasks[0]]);
      mockPrisma.task.count.mockResolvedValue(1);

      const result = await service.findAll(projectId, {
        status: 'TODO' as any,
        page: 1,
        limit: 10,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].status).toBe('TODO');
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'TODO' }),
        }),
      );
    });

    it('should compute totalPages correctly', async () => {
      mockPrisma.$transaction.mockImplementation(async (args: any[]) =>
        Promise.all(args),
      );
      mockPrisma.task.findMany.mockResolvedValue(tasks.slice(0, 1));
      mockPrisma.task.count.mockResolvedValue(5);

      const result = await service.findAll(projectId, {
        page: 1,
        limit: 1,
      });

      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 5,
        page: 1,
        limit: 1,
        totalPages: 5,
      });
    });
  });
});
