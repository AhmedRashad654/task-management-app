import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: any;

  const mockPrisma = {
    project: {
      create: jest.fn<any>(),
      findUnique: jest.fn<any>(),
      findMany: jest.fn<any>(),
      update: jest.fn<any>(),
      delete: jest.fn<any>(),
      count: jest.fn<any>(),
    },
    $transaction: jest.fn<any>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const userId = 'user-1';

    it('should create a project with name only', async () => {
      const dto = { name: 'My Project' };
      const created = {
        id: 'project-1',
        name: 'My Project',
        description: null,
        ownerId: userId,
        owner: { id: userId, name: 'John', email: 'john@t.com' },
        _count: { members: 0, tasks: 0 },
      };

      mockPrisma.project.create.mockResolvedValue(created);

      const result = await service.create(userId, dto);

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: undefined, ownerId: userId },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
      });
      expect(result).toEqual(created);
    });

    it('should create a project with name and description', async () => {
      const dto = { name: 'My Project', description: 'A description' };
      const created = {
        id: 'project-2',
        name: 'My Project',
        description: 'A description',
        ownerId: userId,
        owner: { id: userId, name: 'John', email: 'john@t.com' },
        _count: { members: 0, tasks: 0 },
      };

      mockPrisma.project.create.mockResolvedValue(created);

      const result = await service.create(userId, dto);

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: dto.description, ownerId: userId },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    const projectId = 'project-1';

    it('should update project name', async () => {
      const dto = { name: 'Updated Name' };
      const updated = {
        id: projectId,
        name: 'Updated Name',
        description: null,
        ownerId: 'user-1',
        owner: { id: 'user-1', name: 'John', email: 'john@t.com' },
        _count: { members: 1, tasks: 0 },
      };

      mockPrisma.project.update.mockResolvedValue(updated);

      const result = await service.update(projectId, dto);

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: { name: dto.name },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
      });
      expect(result).toEqual(updated);
    });

    it('should update project description', async () => {
      const dto = { description: 'Updated description' };
      const updated = {
        id: projectId,
        name: 'Project',
        description: 'Updated description',
        ownerId: 'user-1',
        owner: { id: 'user-1', name: 'John', email: 'john@t.com' },
        _count: { members: 1, tasks: 0 },
      };

      mockPrisma.project.update.mockResolvedValue(updated);

      const result = await service.update(projectId, dto);

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: projectId },
        data: { description: dto.description },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
      });
      expect(result).toEqual(updated);
    });
  });
});
