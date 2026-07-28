import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    const result = await this.prisma.$queryRaw`SELECT NOW()`;

    console.log('Database Time:', result);

    return 'Hello World! Database is connected successfully! 🚀';
  }
}
