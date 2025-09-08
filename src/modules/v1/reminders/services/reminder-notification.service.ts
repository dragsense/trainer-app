import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';
import { Reminder } from '../entities/reminder.entity';
import { ReminderType } from '../enums/reminder.enum';
import { NotificationType } from '../../notifications/enums/notification.enum';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class ReminderNotificationService {
    private readonly logger = new Logger(ReminderNotificationService.name);

    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    async sendReminderNotification(reminder: Reminder): Promise<void> {
        const recipients = this.getRecipients(reminder);

        if (recipients.length === 0) {
            this.logger.warn('No valid recipients found for reminder notification');
            return;
        }

        this.logger.log(`Creating ${reminder.type} reminder notifications for ${recipients.length} recipient(s)`);

        // Create notifications for all recipients
        const notificationPromises = recipients.map(async (recipient) => {
            const notificationData = this.buildNotificationData(reminder, recipient);

            try {
                await this.notificationsService.create(notificationData);

            } catch (error) {
                this.logger.error(`Failed to create notification for user ${recipient.id}:`, error.message);
            }
        });

        await Promise.allSettled(notificationPromises);
        this.logger.log(`Successfully processed ${reminder.type} reminder notifications for ${recipients.length} recipient(s)`);
    }

    private getRecipients(reminder: Reminder): User[] {
        const recipients: User[] = [];

        switch (reminder.type) {
            case ReminderType.SESSION:
                // Send to all session clients
                if (reminder.session?.clients) {
                    recipients.push(...reminder.session.clients.filter(client => client.id));
                }
                break;

            case ReminderType.BILLING:
                // Send to the billing user
                if (reminder.billing?.user?.id) {
                    recipients.push(reminder.billing.user);
                }
                break;

            case ReminderType.CUSTOM:
            default:
                // Send to the reminder recipient
                if (reminder.recipient?.id) {
                    recipients.push(reminder.recipient);
                }
                break;
        }

        return recipients;
    }

    private buildNotificationData(reminder: Reminder, recipient: User): CreateNotificationDto {
        const notificationData: CreateNotificationDto = {
            userId: recipient.id,
            title: this.getNotificationTitle(reminder),
            message: this.getNotificationMessage(reminder, recipient),
            type: this.getNotificationType(reminder),
            link: this.getNotificationLink(reminder),
        };

        return notificationData;
    }

    private getNotificationTitle(reminder: Reminder): string {
        const titleMap = {
            [ReminderType.SESSION]: '🏋️ Session Reminder',
            [ReminderType.BILLING]: '💳 Payment Reminder',
            [ReminderType.CUSTOM]: reminder.message?.split('\n')[0] || '🔔 Custom Reminder',
        };
        return titleMap[reminder.type];
    }

    private getNotificationMessage(reminder: Reminder, recipient: User): string {
        const firstName = recipient.profile?.firstName || 'there';

        switch (reminder.type) {
            case ReminderType.SESSION:
                if (!reminder.session) return 'You have an upcoming session.';

                const sessionDate = reminder.session.dateTime ? new Date(reminder.session.dateTime) : null;
                const sessionDateTime = sessionDate ? sessionDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'TBD';

                return `Hi ${firstName}! Your ${reminder.session.type || 'training'} session is scheduled for ${sessionDateTime}. Don't forget to prepare!`;

            case ReminderType.BILLING:
                if (!reminder.billing) return 'You have a pending payment.';

                const amount = reminder.billing.invoiceAmount || 0;
                const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(amount);

                const dueDate = reminder.scheduledAt ? new Date(reminder.scheduledAt).toLocaleDateString() : 'soon';

                return `Hi ${firstName}! Payment of ${formattedAmount} is due ${dueDate}. Click to view payment options.`;

            case ReminderType.CUSTOM:
            default:
                const customMessage = reminder.message || 'You have a new reminder.';
                const messageLines = customMessage.split('\n');
                const shortMessage = messageLines.slice(1).join(' ') || messageLines[0] || 'Check your reminder details.';

                return `Hi ${firstName}! ${shortMessage}`;
        }
    }

    private getNotificationType(reminder: Reminder): NotificationType {
        const typeMap = {
            [ReminderType.SESSION]: NotificationType.SESSION_SCHEDULED,
            [ReminderType.BILLING]: NotificationType.BILLING_DUE,
            [ReminderType.CUSTOM]: NotificationType.GENERAL,
        };
        return typeMap[reminder.type];
    }

    private getNotificationLink(reminder: Reminder): string | undefined {
        switch (reminder.type) {
            case ReminderType.SESSION:
                return reminder.session?.id ? `/sessions/${reminder.session.id}` : '/sessions';

            case ReminderType.BILLING:
                return reminder.billing?.id ? `/billing/${reminder.billing.id}` : '/billing';

            case ReminderType.CUSTOM:
            default:
                return '/dashboard';
        }
    }


 
    
    async sendReminderStatusNotification(reminder: Reminder, status: 'sent' | 'failed' | 'cancelled'): Promise<void> {
        if (!reminder.creator?.id) return;

        const statusMessages = {
            sent: `Reminder "${reminder.message?.split('\n')[0] || 'Untitled'}" has been sent successfully.`,
            failed: `Reminder "${reminder.message?.split('\n')[0] || 'Untitled'}" failed to send. Check details for more info.`,
            cancelled: `Reminder "${reminder.message?.split('\n')[0] || 'Untitled'}" has been cancelled.`,
        };


        try {
            await this.notificationsService.create({
                userId: reminder.creator.id,
                title: `Reminder ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                message: statusMessages[status],
                type: NotificationType.GENERAL,
                link: `/reminders/${reminder.id}`,
            });

            this.logger.log(`Sent ${status} notification for reminder ${reminder.id} to creator ${reminder.creator.id}`);
        } catch (error) {
            this.logger.error(`Failed to send ${status} notification for reminder ${reminder.id}:`, error.message);
        }
    }

}
