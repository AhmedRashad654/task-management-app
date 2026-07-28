import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    await this.prisma.$queryRaw`SELECT NOW()`;

    return 'Hello World! Database is connected successfully! 🚀';
  }
}
