import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EMAIL_PROVIDER } from '../common/email/email.module.js';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn<any>(),
      create: jest.fn<any>(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-token'),
  };

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_REFRESH_EXPIRATION: '7d',
        FRONTEND_URL: 'http://localhost:5173',
      };
      return map[key];
    }),
  };

  const mockEmailProvider = { send: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EMAIL_PROVIDER, useValue: mockEmailProvider },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    const dto = {
      name: 'John',
      email: 'john@test.com',
      password: 'Str0ng!Pass1',
    };

    it('should create a user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1',
        name: dto.name,
        email: dto.email,
        role: 'MEMBER',
        createdAt: new Date(),
      });

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: expect.any(String),
          role: 'MEMBER',
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      expect(result.user.email).toBe(dto.email);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
    });
  });

  describe('login', () => {
    const dto = { email: 'john@test.com', password: 'Str0ng!Pass1' };

    it('should return tokens when credentials are valid', async () => {
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(dto.password, 10);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid-1',
        name: 'John',
        email: dto.email,
        passwordHash: hash,
        role: 'MEMBER',
        createdAt: new Date(),
      });

      const result = await service.login(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe(dto.email);
    });
  });
});
