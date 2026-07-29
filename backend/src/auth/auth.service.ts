import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'node:crypto';
import type { JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Inject } from '@nestjs/common';
import { EMAIL_PROVIDER } from '../common/email/email.module.js';
import type { IEmailProvider } from '../common/email/email.interface.js';
import { passwordResetEmail } from './templates/password-reset.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { Role } from '../../generated/prisma/enums.js';
import { JwtPayload } from '../common/types/authenticated-user.interface.js';
import { AUTH_MESSAGES } from '../common/constants/messages.constant.js';

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: IEmailProvider,
  ) {
    this.refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.refreshExpiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
  }

  private signTokens(user: JwtPayload) {
    const payload = { id: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);

    const refreshOptions: JwtSignOptions = {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn as any,
    };
    const refreshToken = this.jwtService.sign(payload, refreshOptions);

    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return crypto.randomInt(100_000, 1_000_000).toString();
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: Role.MEMBER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = this.signTokens(user);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    const tokens = this.signTokens(user);
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, ...tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.refreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException(AUTH_MESSAGES.NOT_FOUND);
      }

      return this.signTokens(user);
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      return;
    }

    const otp = this.generateOtp();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: otpHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetLink = `${this.frontendUrl}/auth/reset-password?email=${encodeURIComponent(user.email)}`;
    const { subject, html } = passwordResetEmail(otp, resetLink);
    await this.emailProvider.send(user.email, subject, html);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_OTP);
    }

    const otpHash = crypto.createHash('sha256').update(dto.otp).digest('hex');

    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: otpHash,
        consumed: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!resetRecord) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_OTP);
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { consumed: true },
      }),
    ]);
  }
}
