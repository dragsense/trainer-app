import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/base-entity/base.entity';
//import { Payment } from '../payments/entities/payment.entity';
import { PaymentMethodType } from '../enums/payment-method.enum';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('payment_methods')
export class PaymentMethod extends GeneralBaseEntity {

  @ApiProperty({
    description: 'Name of the payment method (e.g., PayPal, Stripe, Bank Transfer)',
    example: 'PayPal',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Type of payment method (e.g., ONLINE, BANK_TRANSFER, CASH)',
    enum: PaymentMethodType,
    example: PaymentMethodType.ONLINE,
  })
  @Column({ type: 'enum', enum: PaymentMethodType })
  type: PaymentMethodType;

  @ApiProperty({
    description: 'Configuration details for the payment method',
    example: { apiKey: 'your-api-key', environment: 'sandbox' },
  })
  @Column('json', { nullable: true })
  configuration: Record<string, any>;

  @ApiProperty({
    description: 'Whether this payment method is active',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'Description or notes about the payment method',
  })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    description: 'Maximum amount allowed for this payment method',
  })
  @Column({ nullable: true })
  maxAmount?: number;

  @ApiProperty({
    description: 'Minimum amount allowed for this payment method',
  })
  @Column({ nullable: true })
  minAmount?: number;

  @ApiProperty({
    description: 'Currency codes supported by this payment method',
    example: ['USD', 'EUR'],
  })
  @Column('simple-array', { nullable: true })
  supportedCurrencies?: string[];

  @ManyToOne(() => User, (user) => user.paymentMethods)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.paymentMethod)
  @ApiProperty({ type: () => [Payment], description: 'Payments made using this payment method' })
  payments: Payment[];
}
