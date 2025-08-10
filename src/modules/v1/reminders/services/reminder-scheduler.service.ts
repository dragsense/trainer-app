import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Reminder } from '../entities/reminder.entity';
import { ReminderType, ReminderStatus, ReminderFrequency, ReminderActions } from '../enums/reminder.enum';
import { UsersService } from '@/modules/v1/users/users.service';
import { ReminderEmailService } from './reminder-email.service';
import { ReminderBillingService } from './reminder-billing.service';
import { ReminderNotificationService } from './reminder-notification.service';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly usersService: UsersService,
    private readonly reminderEmailService: ReminderEmailService,
    private readonly remiderBillingService: ReminderBillingService,
    private readonly reminderNotificationService: ReminderNotificationService,
  ) { }

  async scheduleReminders(): Promise<void> {
    // Get all pending reminders that are due
    const now = new Date();
    const pendingReminders = await this.reminderRepository.find({
      where: {
        status: ReminderStatus.SCHEDULED,
        scheduledAt: LessThan(now),
      },
      relations: ['creator', 'recipient', 'session', 'billing'],
    });

    for (const reminder of pendingReminders) {
      await this.sendReminder(reminder);
    }
  }

  private async sendReminder(reminder: Reminder): Promise<void> {
    try {
      // Send via configured delivery methods
      for (const method of reminder.actions) {
        switch (method.toLowerCase()) {
          case ReminderActions.EMAIL.toLowerCase():
            await this.reminderEmailService.sendReminderEmail(reminder);
            break;
          case ReminderActions.BILLING.toLowerCase():
            await this.remiderBillingService.createReminderBilling(reminder);
            break;
          case ReminderActions.NOTIFICATION.toLowerCase():
            await this.reminderNotificationService.sendReminderNotification(reminder);
            break;
        }
      }
 

      // Update reminder status
      reminder.status = ReminderStatus.SENT;
      reminder.sentAt = new Date();
      reminder.sentCount += 1;
      await this.reminderRepository.save(reminder);

      // Notify creator about successful send
      await this.reminderNotificationService.sendReminderStatusNotification(reminder, 'sent');

      // Schedule next attempt if needed
      if (reminder.frequency === ReminderFrequency.ONCE &&
        reminder.isRecurring &&
        (!reminder.endDate || reminder.endDate > new Date()) &&
        reminder.sentCount < reminder.maxAttempts
      ) {
        reminder.scheduledAt = new Date(
          reminder.scheduledAt.getTime() + reminder.retryInterval * 60000,
        );
        reminder.status = ReminderStatus.SCHEDULED;
        await this.reminderRepository.save(reminder);
      }

    } catch (error) {
      reminder.status = ReminderStatus.FAILED;
      reminder.lastError = error.message;
      reminder.retryCount += 1;

      // Set next retry time if under max attempts
      if (reminder.retryCount < reminder.maxAttempts) {
        reminder.nextRetryAt = new Date(Date.now() + reminder.retryInterval * 60000);
      }

      await this.reminderRepository.save(reminder);
      
      // Notify creator about failure
      await this.reminderNotificationService.sendReminderStatusNotification(reminder, 'failed');
      
      throw error;
    }
  }

  private getDefaultMessage(reminder: Reminder): string {
    let message = '';
    switch (reminder.type) {
      case ReminderType.BILLING:
        message = 'Billing reminder: You have a pending payment due.';
        break;
      case ReminderType.SESSION:
        message = `Session reminder: You have a session scheduled.`;
        break;
      case ReminderType.CUSTOM:
        message = 'This is a custom reminder message.';
        break;
    }
    return message;
  }

  async cancelReminder(id: number): Promise<void> {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['creator', 'recipient'],
    });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    reminder.status = ReminderStatus.CANCELLED;
    await this.reminderRepository.save(reminder);
    
    // Notify creator about cancellation
    await this.reminderNotificationService.sendReminderStatusNotification(reminder, 'cancelled');
  }

  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    return this.reminderRepository.find({
      where: {
        status: ReminderStatus.SCHEDULED,
        scheduledAt: LessThan(now),
      },
      relations: ['creator', 'recipient', 'session'],
    });
  }

  async processReminder(id: number): Promise<void> {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['creator', 'recipient', 'session'],
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    await this.sendReminder(reminder);
  }

  async processImmediateReminders(): Promise<void> {
    const dueReminders = await this.getDueReminders();
    let processedCount = 0;
    let failedCount = 0;

    for (const reminder of dueReminders) {
      try {
        await this.sendReminder(reminder);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process immediate reminder ${reminder.id}:`, error);
        failedCount++;
      }
    }

 
  }

  async retryFailedReminders(): Promise<void> {
    const now = new Date();
    const failedReminders = await this.reminderRepository.find({
      where: [
        { status: ReminderStatus.FAILED },
        { status: ReminderStatus.RETRY }
      ],
      relations: ['creator', 'recipient', 'session'],
    });

    let retriedCount = 0;
    let successCount = 0;

    for (const reminder of failedReminders) {
      // Check if it's time to retry
      if (reminder.nextRetryAt && reminder.nextRetryAt <= now) {
        if (reminder.retryCount < reminder.maxAttempts) {
          try {
            reminder.status = ReminderStatus.RETRY;
            reminder.retryCount += 1;
            reminder.nextRetryAt = new Date(now.getTime() + reminder.retryInterval * 60000);
            await this.reminderRepository.save(reminder);

            await this.sendReminder(reminder);
            retriedCount++;
            successCount++;
          } catch (error) {
            console.error(`Failed to retry reminder ${reminder.id}:`, error);
            retriedCount++;
          }
        }
      }
    }

  }
}
