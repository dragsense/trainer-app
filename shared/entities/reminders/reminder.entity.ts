import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { Billing } from '../billings/billing.entity';
import { FrequencyConfigDto } from '../../dtos';
import { EReminderFrequency, EReminderType, EReminderStatus, EReminderActions } from '../../enums';

@Entity('reminders')
export class Reminder extends GeneralBaseEntity {
  @ApiProperty({
    description: 'Type of reminder (BILLING, SESSION, CUSTOM)',
    enum: EReminderType,
    example: EReminderType.BILLING,
  })
  @Column({ type: 'enum', enum: EReminderType })
  type: EReminderType;

  @ApiProperty({
    description: 'Status of the reminder',
    enum: EReminderStatus,
    example: EReminderStatus.SCHEDULED,
  })
  @Column({ type: 'enum', enum: EReminderStatus, default: EReminderStatus.SCHEDULED })
  status: EReminderStatus;

  @ApiProperty({
    description: 'Message title for the reminder',
    example: 'This is a reminder title',
  })
  @Column({ type: 'varchar', nullable: true })
  title: string;

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
  @JoinColumn()
  recipient?: User;

  @ManyToOne(() => User)
  @JoinColumn()
  creator?: User;

  @ManyToOne(() => Session, { nullable: true })
  @JoinColumn()
  session?: Session;

  @ManyToOne(() => Billing, { nullable: true })
  @JoinColumn()
  billing?: Billing;

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
    description: 'Actions to take for the reminder (EMAIL)',
    example: [EReminderActions.EMAIL],
    isArray: true,
    enum: EReminderActions,
  })
  @Column({ array: true, type: 'enum', enum: EReminderActions, default: [EReminderActions.EMAIL] })
  actions: EReminderActions[];

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
    description: 'Frequency configuration details',
 
    example: {
      intervalMinutes: 30,
      weekdays: [1, 3, 5],
      monthDays: [1, 15],
      timeOfDay: '09:00'
    }
  })
  @Column({ type: 'json', nullable: true })
  frequencyConfig?: any;
}
