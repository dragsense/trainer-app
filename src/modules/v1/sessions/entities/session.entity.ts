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
import { User } from '../../users/entities/user.entity';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { SessionStatus, SessionType } from '../enums/session.enum';
import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { Billing } from '../../billings/entities/billing.entity';
import { BillingCurrency } from '../../billings/enums/billing.enum';
import { PaymentMethodType } from '../../settings/payment-methods/enums/payment-method-type.enum';

@Entity('sessions')
export class Session extends GeneralBaseEntity {
  @ApiProperty({ description: 'Title of the session' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Type of session' })
  @Column({ type: 'enum', enum: SessionType })
  type: SessionType;

  @ApiProperty({
    enum: PaymentMethodType,
    example: PaymentMethodType.STRIPE,
    description: 'Payment method type'
  })
  @Column({
    type: 'enum',
    enum: PaymentMethodType
  })
  paymentMethodType: PaymentMethodType;


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
  @Column({ type: 'enum', enum: BillingCurrency, default: BillingCurrency.USD })
  currency: BillingCurrency;

  @ApiProperty({
    description: 'Session status',
    enum: SessionStatus,
    example: SessionStatus.SCHEDULED,
  })
  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED
  })
  status: SessionStatus;

  @ApiProperty({ description: 'Description or notes about the session' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Location of the session (can be virtual meeting link)' })
  @Column({ nullable: true })
  location?: string;

  @ApiProperty({ description: 'Maximum number of participants (for group sessions)' })
  @Column({ type: 'int', nullable: true })
  maxParticipants?: number;

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
    if (obj.status !== SessionStatus.SCHEDULED) return false;
    const deadline = new Date(obj.startTime);
    deadline.setHours(deadline.getHours() - obj.cancellationDeadline);
    return new Date() < deadline;
  })
  canCancel?: boolean;
}
