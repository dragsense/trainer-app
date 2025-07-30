import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ReminderCreatedEvent, ReminderUpdatedEvent, ReminderDeletedEvent } from '../events/reminder.events';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Reminder } from '../entities/reminder.entity';
import { ReminderFrequency, ReminderStatus } from '../enums/reminder.enum';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';

@Injectable()
export class ReminderSubscriber {
  private readonly logger = new Logger(ReminderSubscriber.name);

  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly schedulerService: ReminderSchedulerService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  @OnEvent('reminder.created')
  async handleReminderCreatedEvent(event: ReminderCreatedEvent) {
    this.logger.log(`Handling reminder created event for reminder ${event.reminderId}`);
    
    const reminder = await this.reminderRepository.findOne({
      where: { id: event.reminderId },
      relations: ['creator', 'recipient', 'session', 'payment'],
    });

    if (!reminder) {
      this.logger.error(`Reminder ${event.reminderId} not found`);
      return;
    }

    await this.scheduleReminder(reminder);
  }

  @OnEvent('reminder.updated')
  async handleReminderUpdatedEvent(event: ReminderUpdatedEvent) {
    this.logger.log(`Handling reminder updated event for reminder ${event.reminderId}`);
    
    // Remove existing cron job if any
    this.removeReminderJob(event.reminderId);

    const reminder = await this.reminderRepository.findOne({
      where: { id: event.reminderId },
      relations: ['creator', 'recipient', 'session', 'payment'],
    });

    if (!reminder) {
      this.logger.error(`Reminder ${event.reminderId} not found`);
      return;
    }

    await this.scheduleReminder(reminder);

    // Process immediately if scheduled for past time
    const now = new Date();
    if (reminder.startAt <= now && (!event.oldStartAt || reminder.startAt !== event.oldStartAt)) {
      await this.schedulerService.processImmediateReminders();
    }
  }

  @OnEvent('reminder.deleted')
  async handleReminderDeletedEvent(event: ReminderDeletedEvent) {
    this.logger.log(`Handling reminder deleted event for reminder ${event.reminderId}`);
    this.removeReminderJob(event.reminderId);
  }

  private async scheduleReminder(reminder: Reminder) {
    const jobName = `reminder_${reminder.id}`;
    
    // Remove existing job if any
    this.removeReminderJob(reminder.id);

    switch (reminder.frequency) {
      case ReminderFrequency.MINUTELY:
        this.scheduleMinutelyJob(reminder);
        break;

      case ReminderFrequency.HOURLY:
        this.scheduleHourlyJob(reminder);
        break;

      case ReminderFrequency.DAILY:
        this.scheduleDailyJob(reminder);
        break;

      case ReminderFrequency.WEEKLY:
        this.scheduleWeeklyJob(reminder);
        break;

      case ReminderFrequency.MONTHLY:
        this.scheduleMonthlyJob(reminder);
        break;

      case ReminderFrequency.ONCE:
        this.scheduleOneTimeJob(reminder);
        break;
    }
  }

  private removeReminderJob(reminderId: number) {
    const jobName = `reminder_${reminderId}`;
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      if (job) {
        this.schedulerRegistry.deleteCronJob(jobName);
        this.logger.log(`Removed cron job ${jobName}`);
      }
    } catch (error) {
      // Job doesn't exist, ignore
    }
  }

  private scheduleMinutelyJob(reminder: Reminder) {
    const interval = reminder.intervalMinutes || 1;
    const cronExpression = `*/${interval} * * * *`;
    this.createCronJob(reminder, cronExpression);
  }

  private scheduleHourlyJob(reminder: Reminder) {
    const interval = Math.floor((reminder.intervalMinutes || 60) / 60);
    const cronExpression = `0 */${interval} * * *`;
    this.createCronJob(reminder, cronExpression);
  }

  private scheduleDailyJob(reminder: Reminder) {
    const [hours, minutes] = reminder.timeOfDay?.split(':').map(Number) || [0, 0];
    const cronExpression = `${minutes} ${hours} * * *`;
    this.createCronJob(reminder, cronExpression);
  }

  private scheduleWeeklyJob(reminder: Reminder) {
    const [hours, minutes] = reminder.timeOfDay?.split(':').map(Number) || [0, 0];
    const weekdays = reminder.weekdays?.join(',') || '*';
    const cronExpression = `${minutes} ${hours} * * ${weekdays}`;
    this.createCronJob(reminder, cronExpression);
  }

  private scheduleMonthlyJob(reminder: Reminder) {
    const [hours, minutes] = reminder.timeOfDay?.split(':').map(Number) || [0, 0];
    const monthDays = reminder.monthDays?.join(',') || '*';
    const cronExpression = `${minutes} ${hours} ${monthDays} * *`;
    this.createCronJob(reminder, cronExpression);
  }

  private createCronJob(reminder: Reminder, cronExpression: string) {
    const jobName = `reminder_${reminder.id}`;
    const job = new CronJob(
      cronExpression,
      () => {
        this.processReminder(reminder).catch(error => {
          this.logger.error(`Error in cron job ${jobName}:`, error);
        });
      },
      null, // onComplete
      true, // start
      undefined, // timezone
      undefined, // context
      false, // runOnInit
    );
    
    try {
      // Remove any existing job first
      this.removeReminderJob(reminder.id);
      
      // Add the new job
      this.schedulerRegistry.addCronJob(jobName, job as any); // Type cast to avoid version mismatch
      job.start();
      
      this.logger.log(`Scheduled recurring job ${jobName} with cron: ${cronExpression}`);
    } catch (error) {
      this.logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  private scheduleOneTimeJob(reminder: Reminder) {
    const jobName = `reminder_${reminder.id}`;
    const job = new CronJob(
      reminder.startAt,
      () => {
        this.processReminder(reminder)
          .catch(error => {
            this.logger.error(`Error in one-time job ${jobName}:`, error);
          })
          .finally(() => {
            // Clean up the job after execution
            this.removeReminderJob(reminder.id);
          });
      },
      null, // onComplete
      true, // start
      undefined, // timezone
      undefined, // context
      false, // runOnInit
    );
    
    try {
      // Remove any existing job first
      this.removeReminderJob(reminder.id);
      
      // Add the new job
      this.schedulerRegistry.addCronJob(jobName, job as any); // Type cast to avoid version mismatch
      job.start();
      
      this.logger.log(`Scheduled one-time job ${jobName} for ${reminder.startAt}`);
    } catch (error) {
      this.logger.error(`Failed to schedule one-time job ${jobName}:`, error);
      throw error;
    }
  }

  private async processReminder(reminder: Reminder) {
    try {
      await this.schedulerService.processReminder(reminder.id);
    } catch (error) {
      this.logger.error(`Error processing reminder ${reminder.id}:`, error);
    }
  }

  // Global scheduled tasks
  @Cron(CronExpression.EVERY_HOUR)
  async handleFailedReminders() {
    await this.schedulerService.retryFailedReminders();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupCompletedReminders() {
    this.logger.log('Cleaning up completed reminders...');
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete completed one-time reminders older than 7 days
    const result = await this.reminderRepository.delete({
      frequency: ReminderFrequency.ONCE,
      status: ReminderStatus.SENT,
      sentAt: LessThanOrEqual(sevenDaysAgo)
    });

    this.logger.log(`Cleaned up ${result.affected} completed reminders`);
  }
}
