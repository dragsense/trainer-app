import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'shared/entities';
import { EUserRole, EUserLevels } from 'shared/enums';

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
      } else if (createdBy.level === EUserLevels[EUserRole.TRAINER] || createdBy.level === EUserLevels[EUserRole.SUPER_ADMIN]) {
        // Admin creating user
        if (user.level === EUserLevels[EUserRole.TRAINER]) {
          await this.sendTrainerWelcomeEmail(context);
        } else {
          await this.sendClientWelcomeEmail(context);
        }
      } else if (createdBy.level === EUserLevels[EUserRole.TRAINER]) {
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎉 Welcome to ${appName}!</h1>
              <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your admin account is ready</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Account Details</h3>
                <div style="color: #4b5563; line-height: 1.6;">
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Email:</strong> ${user.email}</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Role:</strong> Administrator</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Name:</strong> ${user.profile?.firstName || 'Admin'} ${user.profile?.lastName || ''}</p>
                </div>
              </div>

              <div style="background: #eff6ff; padding: 24px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🚀 Get Started</h3>
                <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Access your admin dashboard</li>
                  <li style="margin-bottom: 8px;">Set up your profile information</li>
                  <li style="margin-bottom: 8px;">Configure system settings</li>
                  <li style="margin-bottom: 8px;">Create trainer and client accounts</li>
                  <li>Monitor platform analytics</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="
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
                ">Access Admin Dashboard</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">If you need any assistance, please don't hesitate to contact our support team.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName} - Trainer</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">💪 Welcome to ${appName}!</h1>
              <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your trainer account has been created</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Account Details</h3>
                <div style="color: #4b5563; line-height: 1.6;">
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Email:</strong> ${user.email}</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Role:</strong> Personal Trainer</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Name:</strong> ${user.profile?.firstName || 'Trainer'} ${user.profile?.lastName || ''}</p>
                  ${createdBy ? `<p style="margin: 8px 0;"><strong style="color: #374151;">Created by:</strong> ${createdBy.profile?.firstName || 'Admin'} ${createdBy.profile?.lastName || ''}</p>` : ''}
                </div>
              </div>

              ${tempPassword ? `
                <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                  <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🔐 Login Credentials</h3>
                  <p style="color: #92400e; margin: 8px 0; line-height: 1.6;"><strong>Temporary Password:</strong> <code style="background: #f9fafb; padding: 4px 8px; border-radius: 6px; font-family: 'Poppins', monospace; color: #1f2937;">${tempPassword}</code></p>
                  <p style="color: #92400e; font-size: 14px; margin: 12px 0 0 0; line-height: 1.5;">
                    ⚠️ Please change this password after your first login for security.
                  </p>
                </div>
              ` : ''}

              <div style="background: #ecfdf5; padding: 24px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #10b981;">
                <h3 style="color: #065f46; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🏋️ Your Trainer Tools</h3>
                <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Manage your client roster</li>
                  <li style="margin-bottom: 8px;">Schedule training sessions</li>
                  <li style="margin-bottom: 8px;">Track client progress</li>
                  <li style="margin-bottom: 8px;">Set availability preferences</li>
                  <li>Send workout plans and updates</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="
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
                ">Start Training</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">Ready to inspire and transform lives? Let's get started!</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName} - Client</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎯 Welcome to ${appName}!</h1>
              <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your fitness journey starts here</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Account Details</h3>
                <div style="color: #4b5563; line-height: 1.6;">
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Email:</strong> ${user.email}</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Name:</strong> ${user.profile?.firstName || 'Member'} ${user.profile?.lastName || ''}</p>
                  ${createdBy ? `<p style="margin: 8px 0;"><strong style="color: #374151;">Account created by:</strong> ${createdBy.profile?.firstName || 'Admin'} ${createdBy.profile?.lastName || ''}</p>` : ''}
                </div>
              </div>

              ${tempPassword ? `
                <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                  <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🔐 Login Credentials</h3>
                  <p style="color: #92400e; margin: 8px 0; line-height: 1.6;"><strong>Temporary Password:</strong> <code style="background: #f9fafb; padding: 4px 8px; border-radius: 6px; font-family: 'Poppins', monospace; color: #1f2937;">${tempPassword}</code></p>
                  <p style="color: #92400e; font-size: 14px; margin: 12px 0 0 0; line-height: 1.5;">
                    ⚠️ Please change this password after your first login for security.
                  </p>
                </div>
              ` : ''}

              <div style="background: #fef3c7; padding: 24px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🚀 What's Next?</h3>
                <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Complete your profile setup</li>
                  <li style="margin-bottom: 8px;">Set your fitness goals</li>
                  <li style="margin-bottom: 8px;">Browse available trainers</li>
                  <li style="margin-bottom: 8px;">Book your first session</li>
                  <li>Track your progress</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="
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
                ">Start Your Journey</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">Welcome to your fitness transformation! We're excited to be part of your journey.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
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
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${appName} - Personal Training</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🤝 Welcome to ${appName}!</h1>
              <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your personal trainer has invited you</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Account Details</h3>
                <div style="color: #4b5563; line-height: 1.6;">
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Email:</strong> ${user.email}</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Name:</strong> ${user.profile?.firstName || 'Member'} ${user.profile?.lastName || ''}</p>
                  <p style="margin: 8px 0;"><strong style="color: #374151;">Your Trainer:</strong> ${trainer.profile?.firstName || 'Trainer'} ${trainer.profile?.lastName || ''}</p>
                </div>
              </div>

              ${tempPassword ? `
                <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                  <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🔐 Login Credentials</h3>
                  <p style="color: #92400e; margin: 8px 0; line-height: 1.6;"><strong>Temporary Password:</strong> <code style="background: #f9fafb; padding: 4px 8px; border-radius: 6px; font-family: 'Poppins', monospace; color: #1f2937;">${tempPassword}</code></p>
                  <p style="color: #92400e; font-size: 14px; margin: 12px 0 0 0; line-height: 1.5;">
                    ⚠️ Please change this password after your first login for security.
                  </p>
                </div>
              ` : ''}

              <div style="background: #f3e5f5; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #8b5cf6;">
                <h3 style="color: #6b21a8; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">🎯 Personal Training Benefits</h3>
                <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Personalized workout plans</li>
                  <li style="margin-bottom: 8px;">Direct communication with your trainer</li>
                  <li style="margin-bottom: 8px;">Progress tracking and feedback</li>
                  <li style="margin-bottom: 8px;">Flexible scheduling</li>
                  <li>Expert guidance and motivation</li>
                </ul>
              </div>

              <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #10b981;">
                <p style="color: #065f46; margin: 0; font-style: italic; line-height: 1.6;">
                  "I'm excited to work with you and help you achieve your fitness goals. Let's make this journey amazing together!" 
                  <br><strong style="color: #047857;">- ${trainer.profile?.firstName || 'Your Trainer'}</strong>
                </p>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="
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
                ">Meet Your Trainer</a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">Your personalized fitness journey begins now! 💪</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
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
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset Successful - ${appConfig.name}</title>
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🔐 Password Reset Successful</h1>
                  <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your account is secure</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                    <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello ${user.profile?.firstName || 'User'},</h3>
                    <p style="color: #4b5563; line-height: 1.6; margin: 0;">Your password has been successfully reset and your account is now secure.</p>
                  </div>

                  <div style="background: #fef3c7; padding: 24px; border-radius: 12px; margin-bottom: 32px; border-left: 4px solid #f59e0b;">
                    <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">⚠️ Security Notice</h3>
                    <p style="color: #92400e; margin: 0; line-height: 1.6;">If you did not request this password change, please contact our support team immediately to secure your account.</p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">Best regards,<br><strong style="color: #374151;">The ${appConfig.name} Team</strong></p>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Password reset confirmation sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation to ${user.email}:`, error);
    }
  }
}
