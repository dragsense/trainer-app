import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { User } from '../../users/entities/user.entity';
import { Session } from '../../sessions/entities/session.entity';
import { ReminderFrequency,ReminderType, ReminderStatus } from '../enums/reminder.enum';

@Entity('reminders')
export class Reminder extends GeneralBaseEntity {
  @ApiProperty({
    description: 'Type of reminder (PAYMENT, SESSION, CUSTOM)',
    enum: ReminderType,
    example: ReminderType.PAYMENT,
  })
  @Column({ type: 'enum', enum: ReminderType })
  type: ReminderType;

  @ApiProperty({
    description: 'Status of the reminder',
    enum: ReminderStatus,
    example: ReminderStatus.SCHEDULED,
  })
  @Column({ type: 'enum', enum: ReminderStatus, default: ReminderStatus.SCHEDULED })
  status: ReminderStatus;

  @ApiProperty({
    description: 'Message content for the reminder',
    example: 'This is a reminder message',
  })
  @Column({ type: 'text', nullable: true })
  message: string;

  @ApiProperty({
    description: 'When the reminder should be sent',
    example: '2025-07-07T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @ApiProperty({
    description: 'When the reminder was actually sent',
    example: '2025-07-07T10:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  // Relationships
  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipient_id' })
  recipient?: User;

  @Column({ nullable: true })
  recipient_id?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator?: User;

  @Column({ nullable: true })
  creator_id?: string;

  @ManyToOne(() => Session, { nullable: true })
  @JoinColumn({ name: 'session_id' })
  session?: Session;

  @Column({ nullable: true })
  session_id?: string;

  @Column({ nullable: true })
  payment_id?: string;

  @ApiProperty({
    description: 'Number of times the reminder has been sent',
  })
  @Column({ default: 0 })
  sentCount: number;

  @ApiProperty({
    description: 'Maximum number of times to send this reminder',
  })
  @Column({ default: 3 })
  maxAttempts: number;

  @ApiProperty({
    description: 'Interval between reminder attempts (in minutes)',
  })
  @Column({ default: 1440 }) // 24 hours
  retryInterval: number;

  @ApiProperty({
    description: 'Metadata about the reminder',
    example: { sessionId: '123', paymentId: '456' },
  })
  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Number of retry attempts for failed reminders',
    example: 0,
  })
  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @ApiProperty({
    description: 'Last error message if reminder failed',
    example: 'Failed to send email: Connection timeout',
  })
  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @ApiProperty({
    description: 'Next retry timestamp for failed reminders',
    example: '2025-07-08T10:00:00.000Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt?: Date;

  @ApiProperty({
    description: 'Delivery method (EMAIL, SMS, PUSH_NOTIFICATION)',
    example: 'EMAIL',
  })
  @Column({ type: 'simple-array', default: ['EMAIL'] })
  deliveryMethods: string[];

  @ApiProperty({
    description: 'Priority level of the reminder',
    example: 1,
  })
  @Column({ default: 1 })
  priority: number;

  @ApiProperty({
    description: 'Whether this reminder is recurring',
    example: false,
  })
  @Column({ default: false })
  isRecurring: boolean;

  @ApiProperty({
    description: 'Recurring interval if reminder is recurring (in days)',
    example: 7,
  })
  @Column({ nullable: true })
  recurringInterval?: number;

  @ApiProperty({
    description: 'End date for recurring reminders',
  })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiProperty({
    description: 'Frequency of the reminder',
    enum: ReminderFrequency,
    example: ReminderFrequency.DAILY,
  })
  @Column({ type: 'enum', enum: ReminderFrequency, default: ReminderFrequency.ONCE })
  frequency: ReminderFrequency;

  @ApiProperty({
    description: 'Start date and time for the reminder schedule',
    example: '2025-07-08T09:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  startAt: Date;

  @ApiProperty({
    description: 'Custom interval in minutes (for MINUTELY/HOURLY frequency)',
    example: 30,
  })
  @Column({ nullable: true })
  intervalMinutes?: number;

  @ApiProperty({
    description: 'Selected weekdays for WEEKLY frequency (0 = Sunday, 6 = Saturday)',
    example: [1, 3, 5],
  })
  @Column('simple-array', { nullable: true })
  weekdays?: number[];

  @ApiProperty({
    description: 'Selected days of month for MONTHLY frequency',
    example: [1, 15, 28],
  })
  @Column('simple-array', { nullable: true })
  monthDays?: number[];

  @ApiProperty({
    description: 'Specific time of day for DAILY/WEEKLY/MONTHLY frequency (HH:mm)',
    example: '09:00',
  })
  @Column({ nullable: true })
  timeOfDay?: string;
}
