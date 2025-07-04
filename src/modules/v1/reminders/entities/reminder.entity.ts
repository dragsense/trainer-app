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
import { Payment } from '../../payments/entities/payment.entity';
import { ReminderType } from '../enums/reminder-type.enum';
import { ReminderStatus } from '../enums/reminder-status.enum';

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
    description: 'The trainer who created the reminder',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.createdReminders)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ApiProperty({
    description: 'The client who will receive the reminder',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.receivedReminders)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ApiProperty({
    description: 'The session this reminder is related to (if type is SESSION)',
    type: () => Session,
  })
  @ManyToOne(() => Session, (session) => session.reminders)
  @JoinColumn({ name: 'session_id' })
  session?: Session;

  @ApiProperty({
    description: 'The payment this reminder is related to (if type is PAYMENT)',
    type: () => Payment,
  })
  @ManyToOne(() => Payment, (payment) => payment.reminders)
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @ApiProperty({
    description: 'Custom message for the reminder',
    example: 'Please make your payment for the upcoming session',
  })
  @Column({ nullable: true })
  message: string;

  @ApiProperty({
    description: 'Scheduled time for sending the reminder',
  })
  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @ApiProperty({
    description: 'Actual time when the reminder was sent',
  })
  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

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
    description: 'Last error message if reminder failed',
  })
  @Column({ nullable: true })
  lastError: string;

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
}
