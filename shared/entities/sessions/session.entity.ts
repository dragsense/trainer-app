import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { User } from '../users/user.entity';
import { Reminder } from '../reminders/reminder.entity';
import { GeneralBaseEntity } from '../common/base.entity';
import { Billing } from '../billings/billing.entity';
import { ESessionStatus, ESessionType, EBillingCurrency, EPaymentMethodType } from '../../enums';

@Entity('sessions')
export class Session extends GeneralBaseEntity {
  @ApiProperty({ description: 'Title of the session' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Type of session' })
  @Column({ type: 'enum', enum: ESessionType })
  type: ESessionType;

  @ApiProperty({
    enum: EPaymentMethodType,
    example: EPaymentMethodType.STRIPE,
    description: 'Payment method type'
  })
  @Column({
    type: 'enum',
    enum: EPaymentMethodType
  })
  paymentMethodType: EPaymentMethodType;

  @ApiProperty({ description: 'Date and time of the session' })
  @Column({ type: 'timestamp' })
  dateTime: Date;

  @ApiProperty({ description: 'Duration of the session in minutes' })
  @Column({ type: 'int' })
  duration: number;

  @ApiProperty({ description: 'Price of the session' })
  @Column({ type: 'int' })
  pricePerClient: number;

  @ApiProperty({ example: 'usd', description: 'Currency of the session invoice' })
  @Column({ type: 'enum', enum: EBillingCurrency, default: EBillingCurrency.USD })
  currency: EBillingCurrency;

  @ApiProperty({
    description: 'Session status',
    enum: ESessionStatus,
    example: ESessionStatus.SCHEDULED,
  })
  @Column({
    type: 'enum',
    enum: ESessionStatus,
    default: ESessionStatus.SCHEDULED
  })
  status: ESessionStatus;

  @ApiProperty({ description: 'Description or notes about the session' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Location of the session (can be virtual meeting link)' })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Whether the session payment is required in advance' })
  @Column({ default: true })
  requirePrepayment: boolean;

  @ApiProperty({ description: 'Cancellation deadline in hours before session' })
  @Column({ type: 'int', default: 24 })
  cancellationDeadline: number;

  @ManyToOne(() => User)
  @ApiProperty({
    type: () => User,
    description: 'Admin who created the session'
  })
  creator: User;

  @ManyToOne(() => User)
  @ApiProperty({
    type: () => User,
    description: 'Trainer assigned to the session'
  })
  trainer: User;

  @ApiProperty({ type: () => [User], description: 'Clients assigned to the session' })
  @ManyToMany(() => User, { eager: true, cascade: true })
  @JoinTable({
    name: 'sessions_clients',
    joinColumn: { name: 'sessionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'clientId', referencedColumnName: 'id' },
  })
  clients: User[];

  @OneToMany(() => Reminder, (reminder: Reminder) => reminder.session)
  @ApiProperty({
    type: () => [Reminder],
    description: 'Reminders set for this session'
  })
  reminders: Reminder[];

  @OneToMany(() => Billing, (billing) => billing.session)
  billings: Billing[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by_id' })
  @ApiProperty({
    type: () => User,
    description: 'User who last updated the session'
  })
  updatedBy: User;

  // Virtual fields for easy access
  @ApiProperty({
    description: 'Whether the session is paid',
    readOnly: true
  })
  @Transform(({ obj }) => {
    return obj.payments?.some(p => p.status === 'COMPLETED') || false;
  })
  isPaid?: boolean;

  @ApiProperty({
    description: 'Whether the session can be cancelled without penalty',
    readOnly: true
  })
  @Transform(({ obj }) => {
    if (obj.status !== ESessionStatus.SCHEDULED) return false;
    const deadline = new Date(obj.startTime);
    deadline.setHours(deadline.getHours() - obj.cancellationDeadline);
    return new Date() < deadline;
  })
  canCancel?: boolean;
}
