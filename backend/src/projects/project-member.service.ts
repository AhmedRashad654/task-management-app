import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import { EMAIL_PROVIDER } from '../common/email/email.module.js';
import type { IEmailProvider } from '../common/email/email.interface.js';
import { Role } from '../../generated/prisma/enums.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import {
  projectInvitationEmail,
  newUserProjectInvitationEmail,
} from './templates/project-invitation.js';
import { PROJECT_MESSAGES } from '../common/constants/messages.constant.js';

@Injectable()
export class ProjectMemberService {
  private readonly appOrigin: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: IEmailProvider,
  ) {
    this.appOrigin = this.configService.getOrThrow<string>('APP_ORIGIN');
  }

  async findMembers(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        owner: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      owner: project!.owner,
      members: members.map((member) => ({
        id: member.id,
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        createdAt: member.createdAt,
      })),
    };
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        name: true,
        ownerId: true,
        owner: {
          select: { name: true },
        },
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user && user.id === project!.ownerId) {
      throw new ConflictException(
        PROJECT_MESSAGES.OWNER_CANNOT_ADDED_TO_MEMBER,
      );
    }

    if (user) {
      const existingMember = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId, userId: user.id },
        },
      });

      if (existingMember) {
        throw new ConflictException(PROJECT_MESSAGES.USER_ALREADY_MEMBER);
      }

      await this.prisma.projectMember.create({
        data: { projectId, userId: user.id },
      });

      const { subject, html } = projectInvitationEmail(
        project!.name,
        project!.owner!.name,
      );
      await this.emailProvider.send(user.email, subject, html);

      return;
    }

    const otp = crypto.randomInt(100_000, 1_000_000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const placeHolderHash = await bcrypt.hash(crypto.randomUUID(), 10);

    await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: dto.email.split('@')[0],
          email: dto.email,
          passwordHash: placeHolderHash,
          role: Role.MEMBER,
        },
      });

      await tx.projectMember.create({
        data: {
          projectId,
          userId: newUser.id,
        },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: newUser.id,
          token: otpHash,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    });

    const resetLink = `${this.appOrigin}/reset-password?email=${encodeURIComponent(dto.email)}`;
    const { subject, html } = newUserProjectInvitationEmail(
      project!.name,
      project!.owner!.name,
      otp,
      resetLink,
    );
    await this.emailProvider.send(dto.email, subject, html);
  }

  async removeMember(projectId: string, ownerId: string, memberId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.projectId !== projectId) {
      throw new NotFoundException(PROJECT_MESSAGES.MEMBER_NOT_FOUND);
    }

    if (member.userId === ownerId) {
      throw new ConflictException(PROJECT_MESSAGES.CANNOT_REMOVE_OWNER);
    }

    await this.prisma.projectMember.delete({
      where: { id: memberId },
    });
  }
}
