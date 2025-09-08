import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  UnauthorizedException,
  Param,
} from '@nestjs/common';

import { Response } from 'express';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordWithTokenDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MessageResponseDto } from '@/shared-dto/general.dto';

import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({
    summary: 'User login',
    description: 'Logs in a user and returns an access token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { email, password } = loginDto;

    const { token, user } = await this.authService.validateUser(
      email,
      password,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid credentials');
    }

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.setHeader('Authorization', `Bearer ${token}`);

    return res
      .status(HttpStatus.OK)
      .json({ user, token, message: 'Logged in successfully' });
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 204,
    description: 'User registered successfully.',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 409, description: 'The email is already taken' })
  @Post('signup')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }


  @ApiOperation({
    summary: 'User logout',
    description: 'Logs out the user by clearing the authentication cookie',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
    type: MessageResponseDto
  })
  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.setHeader('Authorization', '');

    return res.status(HttpStatus.OK).json({ message: 'Logged out successful' });
  }


  @Post('send-reset-link')
  @ApiOperation({ summary: 'Request password reset link via email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'If an account with this email exists, a reset link has been sent',
    type: MessageResponseDto
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendResetLink(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using reset token from email' })
  @ApiBody({ type: ResetPasswordWithTokenDto })
  @ApiResponse({
    status: 200, description: 'Password reset successfully',
    type: MessageResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async setNewPassword(@Body() resetDto: ResetPasswordWithTokenDto) {
    return this.authService.resetPassword(resetDto);
  }
}
