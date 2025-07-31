import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Reminder } from '../entities/reminder.entity';
import { ReminderType, ReminderStatus } from '../enums/reminder.enum';
import { ConfigService } from '@nestjs/config';

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

  private async getReminderContent(reminder: Reminder): Promise<string> {
    let content = '';

    switch (reminder.type) {
      case ReminderType.SESSION:
        if (!reminder.session) break;
        content = `
          <h2>Session Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder for your upcoming session:</p>
          <ul>
            <li>Type: ${reminder.session.type}</li>
            <li>Date: ${reminder.session.dateTime?.toLocaleDateString() || 'TBD'}</li>
            <li>Time: ${reminder.session.dateTime?.toLocaleTimeString() || 'TBD'}</li>
            <li>Duration: ${reminder.session.duration || 0} minutes</li>
          </ul>
          <p>Please make sure to be prepared and on time.</p>
        `;
        break;

    /*   case ReminderType.PAYMENT:
        if (!reminder.payment) break;
        content = `
          <h2>Payment Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder for your upcoming payment:</p>
          <ul>
            <li>Amount: $${reminder.payment.amount || 0}</li>
            <li>Description: ${reminder.payment.type || 'N/A'}</li>
          </ul>
          <p>Please ensure to make the payment before the due date.</p>
        `;
        break; */

      case ReminderType.CUSTOM:
      default:
        content = `
          <h2>Reminder</h2>
          <p>Hello,</p>
          <p>${reminder.message || 'You have a new reminder.'}</p>
        `;
    }

    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          ${content}
          <p style="margin-top: 20px;">
            Best regards,<br>
            The Trainer App Team
          </p>
        </body>
      </html>
    `;
  }

  async sendReminderEmail(reminder: Reminder): Promise<void> {
    if (!reminder.recipient?.email) {
      throw new Error('Recipient email not found');
    }

    const subject = this.getReminderSubject(reminder);
    const html = await this.getReminderContent(reminder);

    await this.mailerService.sendMail({
      from: this.fromEmail,
      to: reminder.recipient.email,
      subject,
      html,
    });
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
