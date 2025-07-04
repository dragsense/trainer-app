import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

@Entity('payments')
export class Payment extends GeneralBaseEntity {

  @ApiProperty({
    description: 'Amount of the payment',
    example: 100.50,
  })
  @Column()
  amount: number;

  @ApiProperty({
    description: 'Currency of the payment',
    example: 'USD',
  })
  @Column({ default: 'USD' })
  currency: string;

  @ApiProperty({
    description: 'Payment status (PENDING, COMPLETED, FAILED)',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment type (SESSION, PACKAGE, CUSTOM)',
    enum: PaymentType,
    example: PaymentType.SESSION,
  })
  @Column({ type: 'enum', enum: PaymentType })
  type: PaymentType;

  @ApiProperty({
    description: 'Payment reference or transaction ID',
    example: 'PAY-123456789',
  })
  @Column({ nullable: true })
  reference: string;

  @ApiProperty({
    description: 'Client who made the payment',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn()
  client: User;

  @ApiProperty({
    description: 'Payment method used',
    type: () => PaymentMethod,
  })
  @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.payments)
  @JoinColumn()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Notes or description about the payment',
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Metadata about the payment',
    example: { sessionId: '123', packageId: '456' },
  })
  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Date and time when the payment was processed',
  })
  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @ApiProperty({
    description: 'Date and time when the payment was refunded',
  })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @ApiProperty({
    description: 'Amount refunded if the payment was partially refunded',
  })
  @Column({ nullable: true })
  refundedAmount: number;

  @ApiProperty({
    description: 'External provider response data',
  })
  @Column('json', { nullable: true })
  providerResponse: Record<string, any>;

  @ApiProperty({
    description: 'Payment gateway transaction ID',
  })
  @Column({ nullable: true })
  gatewayTransactionId: string;

  @ApiProperty({
    description: 'Payment receipt URL',
  })
  @Column({ nullable: true })
  receiptUrl: string;

  @ApiProperty({
    description: 'Payment receipt number',
  })
  @Column({ nullable: true })
  receiptNumber: string;

  @OneToMany(() => Reminder, (reminder: Reminder) => reminder.payment)
  @ApiProperty({ type: () => [Reminder], description: 'Reminders related to this payment' })
  reminders: Reminder[];
}
