import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Reminder } from '../entities/reminder.entity';
import { ReminderStatus } from '../enums/reminder-status.enum';
import { ReminderType } from '../enums/reminder-type.enum';
import { UsersService } from '@/modules/v1/users/users.service';
import { User } from '@/modules/v1/users/entities/user.entity';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly usersService: UsersService,
  ) {}

  async scheduleReminders(): Promise<void> {
    // Get all pending reminders that are due
    const now = new Date();
    const pendingReminders = await this.reminderRepository.find({
      where: {
        status: ReminderStatus.SCHEDULED,
        scheduledAt: LessThan(now),
      },
      relations: ['creator', 'recipient', 'session', 'payment'],
    });

    for (const reminder of pendingReminders) {
      await this.sendReminder(reminder);
    }
  }

  private async sendReminder(reminder: Reminder): Promise<void> {
    try {
      const recipient = await this.usersService.findOne({ id: reminder.recipient.id });
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Build reminder message
      let message = reminder.message || this.getDefaultMessage(reminder);

      // Send via configured delivery methods
      for (const method of reminder.deliveryMethods) {
        switch (method.toLowerCase()) {
          case 'email':
            // TODO: Implement actual delivery methods
    // For now, just log the message
    console.log(`Sending ${method} reminder to ${recipient.email}: ${message}`);
            break;
        }
      }

      // Update reminder status
      reminder.status = ReminderStatus.SENT;
      reminder.sentAt = new Date();
      reminder.sentCount += 1;
      await this.reminderRepository.save(reminder);

      // Schedule next attempt if needed
      if (
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
      await this.reminderRepository.save(reminder);
      throw error;
    }
  }

  private getDefaultMessage(reminder: Reminder): string {
    let message = '';
    switch (reminder.type) {
      case ReminderType.PAYMENT:
        message = `Payment reminder: Please make your payment for ${reminder.payment?.description || 'your session'}.`;
        break;
      case ReminderType.SESSION:
        message = `Session reminder: You have a session scheduled for ${reminder.session?.dateTime.toLocaleString()}.`;
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
  }

  async getDueReminders(): Promise<Reminder[]> {
    const now = new Date();
    return this.reminderRepository.find({
      where: {
        status: ReminderStatus.SCHEDULED,
        scheduledAt: LessThan(now),
      },
      relations: ['creator', 'recipient', 'session', 'payment'],
    });
  }
}
