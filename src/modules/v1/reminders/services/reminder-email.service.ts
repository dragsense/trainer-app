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
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 0; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏋️ Session Reminder</h1>
          </div>
          
          <div style="padding: 0 20px;">
            <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong>${recipient?.profile?.firstName || 'there'}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">This is a friendly reminder for your upcoming training session:</p>
            
            <div style="background: #f8f9fa; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 5px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0; margin-bottom: 20px;">📅 Session Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057; width: 30%;">Session Type:</td>
                  <td style="padding: 12px 0; color: #212529;">${reminder.session.type || 'Training Session'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057;">Date:</td>
                  <td style="padding: 12px 0; color: #212529;">${sessionDateTime}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057;">Time:</td>
                  <td style="padding: 12px 0; color: #212529;">${sessionTime}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e9ecef;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057;">Duration:</td>
                  <td style="padding: 12px 0; color: #212529;">${reminder.session.duration || 60} minutes</td>
                </tr>
                ${reminder.session.trainer ? `
                <tr>
                  <td style="padding: 12px 0; font-weight: bold; color: #495057;">Trainer:</td>
                  <td style="padding: 12px 0; color: #212529;">${reminder.session.trainer.profile?.firstName || ''} ${reminder.session.trainer.profile?.lastName || ''}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #e8f4fd; border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 5px solid #2196F3;">
              <h4 style="color: #1976D2; margin-top: 0; margin-bottom: 15px;">💡 Preparation Tips</h4>
              <ul style="margin: 0; padding-left: 20px; color: #424242;">
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
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); padding: 30px 0; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💳 Payment Reminder</h1>
          </div>
          
          <div style="padding: 0 20px;">
            <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong>${recipient?.profile?.firstName || 'there'}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">This is a friendly reminder about your upcoming payment:</p>
            
            <div style="background: #fff5f5; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 5px solid #ff6b6b;">
              <h3 style="color: #d32f2f; margin-top: 0; margin-bottom: 20px;">💰 Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #ffebee;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057; width: 30%;">Amount Due:</td>
                  <td style="padding: 12px 0; color: #d32f2f; font-size: 18px; font-weight: bold;">${formattedAmount}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ffebee;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057;">Invoice Number:</td>
                  <td style="padding: 12px 0; color: #212529;">${reminder.billing.localInvoiceNumber || 'N/A'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #ffebee;">
                  <td style="padding: 12px 0; font-weight: bold; color: #495057;">Due Date:</td>
                  <td style="padding: 12px 0; color: #212529;">${reminder.scheduledAt ? new Date(reminder.scheduledAt).toLocaleDateString() : 'ASAP'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #f3e5f5; border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 5px solid #9c27b0;">
              <h4 style="color: #7b1fa2; margin-top: 0; margin-bottom: 15px;">🏦 Payment Options</h4>
              <ul style="margin: 0; padding-left: 20px; color: #424242;">
                <li style="margin-bottom: 8px;">Online payment through your account dashboard</li>
                <li style="margin-bottom: 8px;">Bank transfer or credit card payment</li>
                <li style="margin-bottom: 8px;">Contact us for alternative payment arrangements</li>
                <li>Questions? Reply to this email or call our support team</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);">
                Make Payment Now
              </a>
            </div>
          </div>
        `;
        break;

      case ReminderType.CUSTOM:
      default:
        const customMessage = reminder.message || 'You have a new reminder.';
        const messageLines = customMessage.split('\n');
        const title = messageLines[0] || 'Custom Reminder';
        const body = messageLines.slice(1).join('<br>') || 'No additional details provided.';
        
        content = `
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px 0; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔔 ${title}</h1>
          </div>
          
          <div style="padding: 0 20px;">
            <p style="font-size: 16px; margin-bottom: 25px;">Hello <strong>${recipient?.profile?.firstName || 'there'}</strong>,</p>
            
            <div style="background: #f1f8e9; border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 5px solid #4CAF50;">
              <h3 style="color: #2e7d32; margin-top: 0; margin-bottom: 20px;">📝 Reminder Details</h3>
              <div style="color: #424242; line-height: 1.6; font-size: 15px;">
                ${body}
              </div>
              ${reminder.scheduledAt ? `
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #c8e6c9;">
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>Scheduled for:</strong> ${new Date(reminder.scheduledAt).toLocaleDateString('en-US', { 
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
            
            <div style="background: #e3f2fd; border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 5px solid #2196F3;">
              <h4 style="color: #1976D2; margin-top: 0; margin-bottom: 15px;">ℹ️ Need Help?</h4>
              <p style="margin: 0; color: #424242;">
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
          <title>Trainer App Reminder</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 20px auto; background-color: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
            ${content}
            
            <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 15px 0; color: #6c757d; font-size: 14px;">
                Best regards,<br>
                <strong style="color: #495057;">The Trainer App Team</strong>
              </p>
              <div style="margin-top: 20px;">
                <a href="#" style="color: #6c757d; text-decoration: none; font-size: 12px; margin: 0 10px;">Unsubscribe</a>
                <span style="color: #dee2e6;">|</span>
                <a href="#" style="color: #6c757d; text-decoration: none; font-size: 12px; margin: 0 10px;">Contact Support</a>
                <span style="color: #dee2e6;">|</span>
                <a href="#" style="color: #6c757d; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #adb5bd; font-size: 11px;">
                © ${new Date().getFullYear()} Trainer App. All rights reserved.
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
