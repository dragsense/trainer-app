import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Reminder } from '../entities/reminder.entity';
import { ReminderType, ReminderStatus } from '../enums/reminder.enum';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';

interface ReminderStats {
  status: ReminderStatus;
  type: ReminderType;
  count: number;
}

@Injectable()
export class ReminderEmailService {
  private readonly logger = new Logger(ReminderEmailService.name);
  private readonly fromEmail: string;
  private readonly adminEmail?: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    const fromEmail = this.configService.get<string>('mailer.from');
    if (!fromEmail) {
      throw new Error('Mailer "from" address not configured');
    }
    this.fromEmail = fromEmail;
    this.adminEmail = this.configService.get<string>('mailer.adminEmail');
  }

  private getReminderSubject(reminder: Reminder): string {
    const subjectMap = {
      [ReminderType.SESSION]: 'Upcoming Session Reminder',
      [ReminderType.BILLING]: 'Billing Due Reminder',
      [ReminderType.CUSTOM]: reminder.message?.split('\n')[0] || 'Custom Reminder',
    };
    return subjectMap[reminder.type];
  }

  private async getReminderContent(reminder: Reminder, recipient: User): Promise<string> {
    let content = '';

    switch (reminder.type) {
      case ReminderType.SESSION:
        if (!reminder.session) break;
        const sessionDate = reminder.session.dateTime ? new Date(reminder.session.dateTime) : null;
        const sessionDateTime = sessionDate ? sessionDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : 'TBD';
        const sessionTime = sessionDate ? sessionDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }) : 'TBD';

        content = `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🏋️ Session Reminder</h1>
            <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your training session is coming up</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello ${recipient?.profile?.firstName || 'there'},</h3>
              <p style="color: #4b5563; line-height: 1.6; margin: 0;">This is a friendly reminder for your upcoming training session:</p>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📅 Session Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 30%;">Session Type:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${reminder.session.type || 'Training Session'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Date:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${sessionDateTime}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Time:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${sessionTime}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Duration:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${reminder.session.duration || 60} minutes</td>
                </tr>
                ${reminder.session.trainer ? `
                <tr>
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Trainer:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${reminder.session.trainer.profile?.firstName || ''} ${reminder.session.trainer.profile?.lastName || ''}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">💡 Preparation Tips</h4>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Arrive 10 minutes early to warm up</li>
                <li style="margin-bottom: 8px;">Bring a water bottle and towel</li>
                <li style="margin-bottom: 8px;">Wear comfortable workout attire</li>
                <li>Don't forget to eat a light meal 2 hours before training</li>
              </ul>
            </div>
          </div>
        `;
        break;

      case ReminderType.BILLING:
        if (!reminder.billing) break;
        const amount = reminder.billing.invoiceAmount || 0;
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);

        content = `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">💳 Payment Reminder</h1>
            <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Your payment is due soon</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello ${recipient?.profile?.firstName || 'there'},</h3>
              <p style="color: #4b5563; line-height: 1.6; margin: 0;">This is a friendly reminder about your upcoming payment:</p>
            </div>
            
            <div style="background: #fef2f2; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
              <h3 style="color: #dc2626; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">💰 Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #fecaca;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151; width: 30%;">Amount Due:</td>
                  <td style="padding: 12px 0; color: #dc2626; font-size: 18px; font-weight: 700;">${formattedAmount}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fecaca;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Invoice Number:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${reminder.billing.localInvoiceNumber || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #fecaca;">
                  <td style="padding: 12px 0; font-weight: 600; color: #374151;">Due Date:</td>
                  <td style="padding: 12px 0; color: #1f2937;">${reminder.scheduledAt ? new Date(reminder.scheduledAt).toLocaleDateString() : 'ASAP'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f3e5f5; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #8b5cf6;">
              <h4 style="color: #6b21a8; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">🏦 Payment Options</h4>
              <ul style="margin: 0; padding-left: 20px; color: #4b5563; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Online payment through your account dashboard</li>
                <li style="margin-bottom: 8px;">Bank transfer or credit card payment</li>
                <li style="margin-bottom: 8px;">Contact us for alternative payment arrangements</li>
                <li>Questions? Reply to this email or call our support team</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="#" style="
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
              ">Make Payment Now</a>
            </div>
          </div>
        `;
        break;

      case ReminderType.CUSTOM:
      default:
        const title = reminder.title || 'You have a new reminder.';
        const body = reminder.message || 'No additional details provided.';

        content = `
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🔔 ${title}</h1>
            <p style="color: #d1fae5; font-size: 18px; margin: 10px 0 0 0; font-weight: 400;">Important reminder for you</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Hello ${recipient?.profile?.firstName || 'there'},</h3>
            </div>
            
            <div style="background: #ecfdf5; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #10b981;">
              <h3 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">📝 Reminder Details</h3>
              <div style="color: #4b5563; line-height: 1.6; font-size: 15px;">
                ${body}
              </div>
              ${reminder.scheduledAt ? `
              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #a7f3d0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                  <strong style="color: #374151;">Scheduled for:</strong> ${new Date(reminder.scheduledAt).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
                </p>
              </div>
              ` : ''}
            </div>
            
            <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 32px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">ℹ️ Need Help?</h4>
              <p style="margin: 0; color: #4b5563; line-height: 1.6;">
                If you have any questions about this reminder or need assistance, 
                please don't hesitate to contact our support team.
              </p>
            </div>
          </div>
        `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>FORMANCE Reminder</title>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); overflow: hidden;">
            ${content}
            
            <div style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Best regards,<br>
                <strong style="color: #374151;">The FORMANCE Team</strong>
              </p>
              <div style="margin-top: 20px;">
                <a href="#" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Unsubscribe</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Contact Support</a>
                <span style="color: #d1d5db;">|</span>
                <a href="#" style="color: #6b7280; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
              </div>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} FORMANCE. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendReminderEmail(reminder: Reminder): Promise<void> {
    const recipients = this.getRecipients(reminder);

    if (recipients.length === 0) {
      throw new Error('No valid recipients found for reminder');
    }

    this.logger.log(`Sending ${reminder.type} reminder to ${recipients.length} recipient(s)`);

    const subject = this.getReminderSubject(reminder);

    // Send emails to all recipients efficiently
    const emailPromises = recipients.map(async (recipient) => {
      const html = await this.getReminderContent(reminder, recipient);

      return this.mailerService.sendMail({
        from: this.fromEmail,
        to: recipient.email,
        subject,
        html,
      });
    });

    await Promise.all(emailPromises);
    this.logger.log(`Successfully sent ${reminder.type} reminder emails to ${recipients.length} recipient(s)`);
  }

  private getRecipients(reminder: Reminder): User[] {
    const recipients: User[] = [];

    switch (reminder.type) {
      case ReminderType.SESSION:
        // Send to all session clients
        if (reminder.session?.clients) {
          recipients.push(...reminder.session.clients.filter(client => client.email));
        }
        break;

      case ReminderType.BILLING:
        // Send to the billing user
        if (reminder.billing?.user?.email) {
          recipients.push(reminder.billing.user);
        }
        break;

      case ReminderType.CUSTOM:
      default:
        // Send to the reminder recipient
        if (reminder.recipient?.email) {
          recipients.push(reminder.recipient);
        }
        break;
    }

    return recipients;
  }

  async sendDailySummary(stats: ReminderStats[]): Promise<void> {
    if (!this.adminEmail) {
      this.logger.warn('Admin email not configured - skipping daily summary');
      return;
    }

    const html = this.generateSummaryHtml(stats, 'Daily');

    await this.mailerService.sendMail({
      from: this.fromEmail,
      to: this.adminEmail,
      subject: 'Daily Reminder Summary',
      html,
    });
  }

  async sendWeeklySummary(stats: ReminderStats[]): Promise<void> {
    if (!this.adminEmail) {
      this.logger.warn('Admin email not configured - skipping weekly summary');
      return;
    }

    const html = this.generateSummaryHtml(stats, 'Weekly');

    await this.mailerService.sendMail({
      from: this.fromEmail,
      to: this.adminEmail,
      subject: 'Weekly Reminder Summary',
      html,
    });
  }

  private generateSummaryHtml(stats: ReminderStats[], period: 'Daily' | 'Weekly'): string {
    const typeStats = stats.reduce((acc, stat) => {
      if (!acc[stat.type]) {
        acc[stat.type] = { total: 0, status: {} };
      }
      acc[stat.type].total += stat.count;
      acc[stat.type].status[stat.status] = stat.count;
      return acc;
    }, {} as Record<string, { total: number; status: Record<string, number> }>);

    const content = Object.entries(typeStats)
      .map(([type, data]) => {
        const statusList = Object.entries(data.status)
          .map(([status, count]) => `<li>${status}: ${count}</li>`)
          .join('');

        return `
          <div style="margin-bottom: 20px;">
            <h3>${type} Reminders</h3>
            <p>Total: ${data.total}</p>
            <ul>${statusList}</ul>
          </div>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>${period} Reminder Summary</h2>
          ${content}
          <p style="margin-top: 20px;">Generated at ${new Date().toLocaleString()}</p>
        </body>
      </html>
    `;
  }
}
