import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { MessageResponse } from '@/interfaces/general.interface';

import { User } from '../users/entities/user.entity';

import { ResetPasswordWithTokenDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';

import { UsersService } from '../users/users.service';
import { UserLevels, UserRole } from '../users/enums/user.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly userService: UsersService,
  ) { }

  async register(
    registerDto: RegisterDto,
  ): Promise<MessageResponse> {

    const { firstName, lastName, ...userDtoData } = registerDto;

    return await this.userService.create({
      ...userDtoData,
      profile: {
        firstName,
        lastName
      },
      level: UserLevels[UserRole.TRAINER],
    });
  }


  async validateUser(email: string, clientPassword: string) {

    const user = await this.userService.findOne(
      { email },
      {
        select: ['id', 'email', 'level', 'password'],
        relations: ['profile']
      });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(clientPassword, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = this.jwtService.sign({
      id: user.id,
      level: user.level,
    });

    const { password, ...userDetail } = user;

    return { user: userDetail, token };
  }

  async sendResetLink(email: string): Promise<{ message: string }> {
    const user = await this.userService.findOne({ email }, { select: ['id', 'email'], relations: ['profile'] });

    if (user) {

      const appConfig = this.configService.get('app');
      const jwtConfig = this.configService.get('jwt');

      const token = this.jwtService.sign(
        {
          sub: user.id,
          purpose: 'password_reset',
        },
        {
          expiresIn: '15m',
          secret: jwtConfig.secret,
        },
      );

      const appUrl = appConfig.appUrl;
      const appName = appConfig.name;
      const resetPasswordPath = appConfig.passwordResetPath;
      const resetUrl = `${appUrl}/${resetPasswordPath}?token=${token}`;

      const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request - ${appName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🔐 Password Reset Request</h1>
              <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Secure your account</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello ${user.profile?.firstName || 'User'},</h3>
                <p style="color: #4b5563; line-height: 1.6; margin: 0;">We received a request to reset your password for account <strong style="color: #374151;">${user.email}</strong>.</p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="
                  display: inline-block;
                  padding: 16px 32px;
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 12px;
                  font-weight: 600;
                  font-size: 16px;
                  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                  transition: all 0.2s ease;
                ">Reset Your Password</a>
              </div>

              <div style="background: #fef3c7; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">⏰ Important</h3>
                <p style="color: #92400e; margin: 0; line-height: 1.6;">This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
              </div>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">Can't click the button? Copy this link to your browser:</p>
                <p style="color: #4b5563; font-size: 12px; margin: 0; word-break: break-all; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">${resetUrl}</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">If you need assistance, please don't hesitate to contact our support team.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

      const mailerConfig = this.configService.get('mailer');


      try {
        await this.mailerService.sendMail({
          to: user.email,
          from: mailerConfig.from,
          subject: appName + ' - Your Password Reset Instructions',
          html: emailContent,

          text: `Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link expires in 15 minutes.`,
        });

      } catch (error) {
        console.error('Error sending reset email:', error);
        throw new HttpException(
          'Failed to send reset email. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    return {
      message:
        'If an account with this email exists, a reset link has been sent',
    };
  }

  async resetPassword(
    resetDta: ResetPasswordWithTokenDto,
  ): Promise<{ message: string }> {
    const { token, newPassword } = resetDta;

    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new BadRequestException('Invalid or expired token');
    }

    return await this.userService.resetPassword(payload.sub, { newPassword }, true);

  }
}
