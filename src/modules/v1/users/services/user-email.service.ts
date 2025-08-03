import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../entities/user.entity';
import { UserRole, UserLevels } from '../enums/user.enum';

export interface OnboardingEmailContext {
  user: User;
  tempPassword?: string;
  createdBy?: User;
  welcomeMessage?: string;
  additionalInstructions?: string;
}

@Injectable()
export class UserEmailService {
  private readonly logger = new Logger(UserEmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Sends appropriate onboarding email based on context
   */
  async sendOnboardingEmail(context: OnboardingEmailContext): Promise<void> {
    try {
      const { user, tempPassword, createdBy } = context;
      
      // Determine email type based on creation context
      if (!createdBy) {
        // Self-registration (admin signup)
        await this.sendAdminWelcomeEmail(context);
      } else if (createdBy.level === UserLevels[UserRole.ADMIN] || createdBy.level === UserLevels[UserRole.SUPER_ADMIN]) {
        // Admin creating user
        if (user.level === UserLevels[UserRole.TRAINER]) {
          await this.sendTrainerWelcomeEmail(context);
        } else {
          await this.sendClientWelcomeEmail(context);
        }
      } else if (createdBy.level === UserLevels[UserRole.TRAINER]) {
        // Trainer creating client
        await this.sendClientWelcomeByTrainerEmail(context);
      }

      this.logger.log(`Onboarding email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send onboarding email to ${context.user.email}:`, error);
      throw error;
    }
  }

  /**
   * Admin self-registration welcome email
   */
  private async sendAdminWelcomeEmail(context: OnboardingEmailContext): Promise<void> {
    const { user } = context;
    const appConfig = this.configService.get('app');
    const loginUrl = `${appConfig.appUrl}/${appConfig.loginPath}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_FROM'),
      subject: `Welcome to ${appConfig.name} - Admin Account Created`,
      html: this.getAdminWelcomeTemplate({
        user,
        appName: appConfig.name,
        loginUrl,
      }),
      text: `Welcome to ${appConfig.name}! Your admin account has been created successfully.`,
    });
  }

  /**
   * Trainer welcome email (created by admin)
   */
  private async sendTrainerWelcomeEmail(context: OnboardingEmailContext): Promise<void> {
    const { user, tempPassword, createdBy } = context;
    const appConfig = this.configService.get('app');
    const loginUrl = `${appConfig.appUrl}/${appConfig.loginPath}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_FROM'),
      subject: `Welcome to ${appConfig.name} - Trainer Account`,
      html: this.getTrainerWelcomeTemplate({
        user,
        tempPassword,
        createdBy,
        appName: appConfig.name,
        loginUrl,
      }),
      text: `Welcome to ${appConfig.name}! Your trainer account has been created.`,
    });
  }

  /**
   * Client welcome email (created by admin)
   */
  private async sendClientWelcomeEmail(context: OnboardingEmailContext): Promise<void> {
    const { user, tempPassword, createdBy } = context;
    const appConfig = this.configService.get('app');
    const loginUrl = `${appConfig.appUrl}/${appConfig.loginPath}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_FROM'),
      subject: `Welcome to ${appConfig.name} - Your Fitness Journey Begins`,
      html: this.getClientWelcomeTemplate({
        user,
        tempPassword,
        createdBy,
        appName: appConfig.name,
        loginUrl,
      }),
      text: `Welcome to ${appConfig.name}! Your account has been created and your fitness journey begins now.`,
    });
  }

  /**
   * Client welcome email (created by trainer)
   */
  private async sendClientWelcomeByTrainerEmail(context: OnboardingEmailContext): Promise<void> {
    const { user, tempPassword, createdBy } = context;
    
    if (!createdBy) {
      throw new Error('Trainer information is required for client welcome email');
    }
    
    const appConfig = this.configService.get('app');
    const loginUrl = `${appConfig.appUrl}/${appConfig.loginPath}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: this.configService.get('MAIL_FROM'),
      subject: `Welcome to ${appConfig.name} - Your Personal Training Journey`,
      html: this.getClientByTrainerWelcomeTemplate({
        user,
        tempPassword,
        trainer: createdBy,
        appName: appConfig.name,
        loginUrl,
      }),
      text: `Welcome to ${appConfig.name}! Your trainer has created your account.`,
    });
  }

  /**
   * Admin welcome email template
   */
  private getAdminWelcomeTemplate(data: {
    user: User;
    appName: string;
    loginUrl: string;
  }): string {
    const { user, appName, loginUrl } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2196f3; margin: 0; font-size: 28px;">🎉 Welcome to ${appName}!</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0;">Your admin account is ready</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Account Details</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> Administrator</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.profile?.firstName || 'Admin'} ${user.profile?.lastName || ''}</p>
          </div>

          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1976d2; margin-top: 0;">🚀 Get Started</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li>Access your admin dashboard</li>
              <li>Set up your profile information</li>
              <li>Configure system settings</li>
              <li>Create trainer and client accounts</li>
              <li>Monitor platform analytics</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="
              display: inline-block;
              padding: 15px 30px;
              background: #2196f3;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            ">Access Admin Dashboard</a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>If you need any assistance, please don't hesitate to contact our support team.</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Trainer welcome email template
   */
  private getTrainerWelcomeTemplate(data: {
    user: User;
    tempPassword?: string;
    createdBy?: User;
    appName: string;
    loginUrl: string;
  }): string {
    const { user, tempPassword, createdBy, appName, loginUrl } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4caf50; margin: 0; font-size: 28px;">💪 Welcome to ${appName}!</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0;">Your trainer account has been created</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Account Details</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Role:</strong> Personal Trainer</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.profile?.firstName || 'Trainer'} ${user.profile?.lastName || ''}</p>
            ${createdBy ? `<p style="margin: 5px 0;"><strong>Created by:</strong> ${createdBy.profile?.firstName || 'Admin'} ${createdBy.profile?.lastName || ''}</p>` : ''}
          </div>

          ${tempPassword ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">🔐 Login Credentials</h3>
              <p style="color: #856404; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0;">
                ⚠️ Please change this password after your first login for security.
              </p>
            </div>
          ` : ''}

          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2e7d32; margin-top: 0;">🏋️ Your Trainer Tools</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li>Manage your client roster</li>
              <li>Schedule training sessions</li>
              <li>Track client progress</li>
              <li>Set availability preferences</li>
              <li>Send workout plans and updates</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="
              display: inline-block;
              padding: 15px 30px;
              background: #4caf50;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            ">Start Training</a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Ready to inspire and transform lives? Let's get started!</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Client welcome email template (created by admin)
   */
  private getClientWelcomeTemplate(data: {
    user: User;
    tempPassword?: string;
    createdBy?: User;
    appName: string;
    loginUrl: string;
  }): string {
    const { user, tempPassword, createdBy, appName, loginUrl } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff5722; margin: 0; font-size: 28px;">🎯 Welcome to ${appName}!</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0;">Your fitness journey starts here</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Account Details</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.profile?.firstName || 'Member'} ${user.profile?.lastName || ''}</p>
            ${createdBy ? `<p style="margin: 5px 0;"><strong>Account created by:</strong> ${createdBy.profile?.firstName || 'Admin'} ${createdBy.profile?.lastName || ''}</p>` : ''}
          </div>

          ${tempPassword ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">🔐 Login Credentials</h3>
              <p style="color: #856404; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0;">
                ⚠️ Please change this password after your first login for security.
              </p>
            </div>
          ` : ''}

          <div style="background: #fef7e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #f57c00; margin-top: 0;">🚀 What's Next?</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li>Complete your profile setup</li>
              <li>Set your fitness goals</li>
              <li>Browse available trainers</li>
              <li>Book your first session</li>
              <li>Track your progress</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="
              display: inline-block;
              padding: 15px 30px;
              background: #ff5722;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            ">Start Your Journey</a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Welcome to your fitness transformation! We're excited to be part of your journey.</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Client welcome email template (created by trainer)
   */
  private getClientByTrainerWelcomeTemplate(data: {
    user: User;
    tempPassword?: string;
    trainer: User;
    appName: string;
    loginUrl: string;
  }): string {
    const { user, tempPassword, trainer, appName, loginUrl } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #9c27b0; margin: 0; font-size: 28px;">🤝 Welcome to ${appName}!</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0;">Your personal trainer has invited you</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Account Details</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.profile?.firstName || 'Member'} ${user.profile?.lastName || ''}</p>
            <p style="margin: 5px 0;"><strong>Your Trainer:</strong> ${trainer.profile?.firstName || 'Trainer'} ${trainer.profile?.lastName || ''}</p>
          </div>

          ${tempPassword ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">🔐 Login Credentials</h3>
              <p style="color: #856404; margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
              <p style="color: #856404; font-size: 14px; margin: 10px 0 0 0;">
                ⚠️ Please change this password after your first login for security.
              </p>
            </div>
          ` : ''}

          <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7b1fa2; margin-top: 0;">🎯 Personal Training Benefits</h3>
            <ul style="color: #555; line-height: 1.6;">
              <li>Personalized workout plans</li>
              <li>Direct communication with your trainer</li>
              <li>Progress tracking and feedback</li>
              <li>Flexible scheduling</li>
              <li>Expert guidance and motivation</li>
            </ul>
          </div>

          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="color: #2e7d32; margin: 0; font-style: italic;">
              "I'm excited to work with you and help you achieve your fitness goals. Let's make this journey amazing together!" 
              <br><strong>- ${trainer.profile?.firstName || 'Your Trainer'}</strong>
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="
              display: inline-block;
              padding: 15px 30px;
              background: #9c27b0;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            ">Meet Your Trainer</a>
          </div>

          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Your personalized fitness journey begins now! 💪</p>
            <p style="margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Send password reset success notification
   */
  async sendPasswordResetConfirmation(user: User): Promise<void> {
    try {
      const appConfig = this.configService.get('app');
      
      await this.mailerService.sendMail({
        to: user.email,
        from: this.configService.get('MAIL_FROM'),
        subject: `Password Reset Successful - ${appConfig.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h3>Password Reset Successful</h3>
            <p>Hello ${user.profile?.firstName || 'User'},</p>
            <p>Your password has been successfully reset.</p>
            <p>If you did not request this change, please contact support immediately.</p>
            <p>Best regards,<br>The ${appConfig.name} Team</p>
          </div>
        `,
      });

      this.logger.log(`Password reset confirmation sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation to ${user.email}:`, error);
    }
  }
}
