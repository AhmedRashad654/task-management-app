import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PROJECT_MESSAGES } from '../common/constants/messages.constant.js';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const projectId = request.params?.id;

    if (!userId || !projectId) {
      throw new NotFoundException(PROJECT_MESSAGES.NOT_FOUND);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      throw new NotFoundException(PROJECT_MESSAGES.NOT_FOUND);
    }

    if (project.ownerId === userId) {
      return true;
    }

    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!member) {
      throw new NotFoundException(PROJECT_MESSAGES.NOT_FOUND);
    }

    return true;
  }
}
