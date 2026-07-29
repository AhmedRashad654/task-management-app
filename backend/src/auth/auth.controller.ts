import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { ResponseMessage } from '../common/decorators/response-message.decorator.js';
import { AUTH_MESSAGES } from '../common/constants/messages.constant.js';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth/refresh',
  });
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ResponseMessage(AUTH_MESSAGES.REGISTERED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    const { refreshToken, ...rest } = result;
    setRefreshCookie(res, refreshToken);
    return rest;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ResponseMessage(AUTH_MESSAGES.LOGGED_IN)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    const { refreshToken, ...rest } = result;
    setRefreshCookie(res, refreshToken);
    return rest;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Refresh token not found' };
    }
    const result = await this.authService.refresh(token);
    const { refreshToken, ...rest } = result;
    setRefreshCookie(res, refreshToken);
    return rest;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
    });
    return { message: AUTH_MESSAGES.LOGGED_OUT };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if account exists',
  })
  @ResponseMessage(AUTH_MESSAGES.PASSWORD_RESET_REQUESTED)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ResponseMessage(AUTH_MESSAGES.PASSWORD_RESET_SUCCESS)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
