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
import { FrequencyConfigDto } from '../dto/frequency-config.dto';

@Injectable()
export class ReminderSubscriber {
  private readonly logger = new Logger(ReminderSubscriber.name);

  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly schedulerService: ReminderSchedulerService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) { }

  @OnEvent('reminder.created')
  async handleReminderCreatedEvent(event: ReminderCreatedEvent) {
    this.logger.log(`Handling reminder created event for reminder ${event.reminderId}`);

    const reminder = await this.reminderRepository.findOne({
      where: { id: event.reminderId },
      relations: ['creator', 'recipient', 'session'],
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
      relations: ['creator', 'recipient', 'session'],
    });

    if (!reminder) {
      this.logger.error(`Reminder ${event.reminderId} not found`);
      return;
    }

    await this.scheduleReminder(reminder);

    // Process immediately if scheduled for past time
    const now = new Date();
    if (reminder.scheduledAt <= now && (!event.oldStartAt || reminder.scheduledAt !== event.oldStartAt)) {
      await this.schedulerService.processImmediateReminders();
    }
  }

  @OnEvent('reminder.deleted')
  async handleReminderDeletedEvent(event: ReminderDeletedEvent) {
    this.logger.log(`Handling reminder deleted event for reminder ${event.reminderId}`);
    this.removeReminderJob(event.reminderId);
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



  private getTimeOfDay(timeOfDay?: string): [number, number] {
    const isValidFormat = /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeOfDay || "");
    if (!isValidFormat) return [0, 0];
    return timeOfDay!.split(":").map(Number) as [number, number];
  }

  private buildCronExpression(
    config?: FrequencyConfigDto
  ): string {
    const { frequency, timeOfDay, intervalMinutes, weekdays, monthDays } = config ?? {};

    // If fixed time of day
    if (timeOfDay) {
      const [hours, minutes] = this.getTimeOfDay(timeOfDay);

      if (frequency === ReminderFrequency.WEEKLY) {
        const days = weekdays?.length ? weekdays.join(",") : "*";
        return `${minutes} ${hours} * * ${days}`;
      }

      if (frequency === ReminderFrequency.MONTHLY) {
        const days = monthDays?.length ? monthDays.join(",") : "*";
        return `${minutes} ${hours} ${days} * *`;
      }

      // DAILY or ONCE style
      return `${minutes} ${hours} * * *`;
    }

    // If interval-based
    if (intervalMinutes) {
      if (frequency === ReminderFrequency.WEEKLY) {
        const days = weekdays?.length ? weekdays.join(",") : "*";
        return `*/${intervalMinutes} * * * ${days}`;
      }

      if (frequency === ReminderFrequency.MONTHLY) {
        const days = monthDays?.length ? monthDays.join(",") : "*";
        return `*/${intervalMinutes} * * ${days} *`;
      }

      // DAILY or default
      return `*/${intervalMinutes} * * * *`;
    }

    throw new Error("Invalid frequency configuration");
  }

  private scheduleReminder(reminder: Reminder) {

    const { frequencyConfig } = reminder;

    if (frequencyConfig?.frequency === ReminderFrequency.ONCE)
      this.scheduleOneTimeJob(reminder)
    else {
      const cronExpression = this.buildCronExpression(reminder.frequencyConfig);
      this.createCronJob(reminder, cronExpression);
    }
  }

  private createCronJob(reminder: Reminder, cronExpression: string) {
    const jobName = `reminder_${reminder.id}`;
    const job = new CronJob(
      cronExpression,
      () => {
        if (new Date() >= reminder.scheduledAt) {
          this.processReminder(reminder).catch(error => {
            this.logger.error(`Error in cron job ${jobName}:`, error);
          });
        }
      },
      null, // onComplete
      false, // start
      undefined, // timezone
      undefined, // context
      false, // runOnInit
    );

    try {
      // Remove any existing job first
      this.removeReminderJob(reminder.id);

      // Add the new job
      this.schedulerRegistry.addCronJob(jobName, job as any); // Type cast to avoid version mismatch
      const now = new Date();

      if (reminder.scheduledAt > now) {
        const starterJobName = `${jobName}_starter`;
        const starterJob = new CronJob(reminder.scheduledAt, () => {
          job.start();
          this.logger.log(`Started recurring job ${jobName} at ${new Date().toISOString()}`);
          this.schedulerRegistry.deleteCronJob(starterJobName);
        });
        starterJob.start();

        this.logger.log(`Scheduled recurring job ${jobName} to start at ${reminder.scheduledAt.toISOString()} with cron: ${cronExpression}`);
      } else {
        // Start immediately if scheduledAt is in the past
        job.start();
        this.logger.log(`Scheduled recurring job ${jobName} immediately with cron: ${cronExpression}`);
      }
    } catch (error) {
      this.logger.error(`Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  private scheduleOneTimeJob(reminder: Reminder) {
    const jobName = `reminder_${reminder.id}`;
    let scheduledAt = new Date(reminder.scheduledAt);

    const job = new CronJob(
      scheduledAt,
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

      this.logger.log(`Scheduled one-time job ${jobName} for ${reminder.scheduledAt}`);
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
  @Cron(CronExpression.EVERY_5_HOURS)
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
      frequencyConfig: { frequency: ReminderFrequency.ONCE },
      status: ReminderStatus.SENT,
      sentAt: LessThanOrEqual(sevenDaysAgo)
    });

    this.logger.log(`Cleaned up ${result.affected} completed reminders`);
  }
}
