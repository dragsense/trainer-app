/* eslint-disable prettier/prettier */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/modules/v1/users/entities/user.entity';
import { BillingCurrency, BillingStatus, BillingType } from '../enums/billing.enum';
import { Session } from '@/modules/v1/sessions/entities/session.entity';
import { Reminder } from '../../reminders/entities/reminder.entity';

@Entity('billings')
export class Billing {
    @ApiProperty({ example: 1, description: 'Unique identifier for the billing record' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ enum: BillingType, example: BillingType.INDIVIDUAL, description: 'Type of Billing' })
    @Column({ type: 'enum', enum: BillingType })
    type: BillingType;

    @ApiProperty({ example: 'in_1234567890', description: 'Stripe Invoice ID' })
    @Column({ type: 'varchar', nullable: true })
    stripeInvoiceId: string;

    @ApiProperty({ enum: BillingStatus, example: BillingStatus.PENDING, description: 'Status of the billing' })
    @Column({ type: 'enum', enum: BillingStatus, default: BillingStatus.PENDING })
    status: BillingStatus;

    @ApiProperty({ example: 1000, description: 'Invoice amount in cents' })
    @Column({ type: 'integer', nullable: true })
    invoiceAmount: number;

    @ApiProperty({ example: 'usd', description: 'Currency of the invoice' })
    @Column({ type: 'enum', enum: BillingCurrency, default: BillingCurrency.USD })
    currency: BillingCurrency;

    @ApiProperty({ type: () => User, description: 'User (member) associated with the billing' })
    @ManyToOne(() => User, (user) => user.billings, { eager: true })
    user: User;

    @ApiProperty({ type: () => Session, description: 'Session associated with the billing (if applicable)' })
    @ManyToOne(() => Session, (session) => session.billings, { eager: true, nullable: true })
    @JoinColumn({ name: 'sessionId' })
    session: Session;

    // 🧾 Local Invoice Metadata
    @ApiProperty({ example: 'INV-2025-001', description: 'Local Invoice Number' })
    @Column({ type: 'varchar', nullable: true })
    localInvoiceNumber: string;

    @ApiProperty({ example: '2025-06-23', description: 'Local Invoice Issue Date' })
    @Column({ type: 'date', nullable: true })
    issueDate: Date;

    @ApiProperty({ example: '2025-07-07', description: 'Invoice due date' })
    @Column({ type: 'date', nullable: true })
    dueDate: Date;

    @ApiProperty({
        example: [
            {
                description: 'Consulting Session',
                quantity: 1,
                unitPrice: 10000,
                amount: 10000,
                tax: 0
            }
        ],
        description: 'Line items stored as JSON array'
    })
    @Column({ type: 'jsonb', nullable: true })
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        amount: number;
        tax?: number;
    }[];

    @ApiProperty({ example: 10000, description: 'Total tax amount' })
    @Column({ type: 'integer', nullable: true })
    totalTax: number;

    @ApiProperty({ example: 0, description: 'Any discounts applied' })
    @Column({ type: 'integer', nullable: true })
    discount: number;

    @ApiProperty({ example: 10000, description: 'Final total after tax and discount' })
    @Column({ type: 'integer', nullable: true })
    totalAmount: number;

    @ApiProperty({ example: 'Thank you for your business!', description: 'Optional invoice note' })
    @Column({ type: 'text', nullable: true })
    notes: string;

    @ApiProperty({ example: 'Net 14', description: 'Payment terms (e.g., Net 30)' })
    @Column({ type: 'varchar', nullable: true })
    terms: string;


    @OneToMany(() => Reminder, (reminder: Reminder) => reminder.session)
    @ApiProperty({
        type: () => [Reminder],
        description: 'Reminders set for this session'
    })
    reminders: Reminder[];

    @ApiProperty({ example: '2025-06-23T10:00:00Z', description: 'When the billing record was created' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ example: '2025-06-23T10:15:00Z', description: 'When the billing record was last updated' })
    @UpdateDateColumn()
    updatedAt: Date;
}
