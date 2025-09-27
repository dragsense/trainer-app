import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';
import { Session } from '../sessions/session.entity';
import { Reminder } from '../reminders/reminder.entity';
import { PaymentMethod } from '../settings/payment-method.entity';
import { GeneralBaseEntity } from '../common/base.entity';
import { FileUpload } from '../file-uploads/file-upload.entity';
import { IFileUpload } from '../../interfaces/file-upload.interface';
import { EBillingCurrency, EBillingStatus, EBillingType } from '../../enums/billing.enum';

@Entity('billings')
export class Billing extends GeneralBaseEntity {
    @ApiProperty({ enum: EBillingType, example: EBillingType.INDIVIDUAL, description: 'Type of Billing' })
    @Column({ type: 'enum', enum: EBillingType })
    type: EBillingType;

    @ApiProperty({ example: 'in_1234567890', description: 'Stripe Invoice ID' })
    @Column({ type: 'varchar', nullable: true })
    stripeInvoiceId: string;

    @ApiProperty({ enum: EBillingStatus, example: EBillingStatus.PENDING, description: 'Status of the billing' })
    @Column({ type: 'enum', enum: EBillingStatus, default: EBillingStatus.PENDING })
    status: EBillingStatus;

    @ApiProperty({ example: 1000, description: 'Invoice amount in cents' })
    @Column({ type: 'integer', nullable: true })
    invoiceAmount: number;

    @ApiProperty({ example: 1000, description: 'Invoice amount in cents' })
    @Column({ type: 'integer', nullable: true })
    dueAmount: number;

    @ApiProperty({ example: 'usd', description: 'Currency of the invoice' })
    @Column({ type: 'enum', enum: EBillingCurrency, default: EBillingCurrency.USD })
    currency: EBillingCurrency;

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
    @Column({ type: 'timestamp', nullable: true })
    issueDate: Date;

    @ApiProperty({ example: '2025-07-07', description: 'Invoice due date' })
    @Column({ type: 'timestamp', nullable: true })
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
        description: 'Reminders set for this billing'
    })
    reminders: Reminder[];

    @ManyToOne(() => PaymentMethod, (paymentMethod: PaymentMethod) => paymentMethod.billings, { nullable: true })
    @ApiProperty({
        type: () => PaymentMethod,
        description: 'billing set for payment Method'
    })
    paymentMethod: PaymentMethod;

    @ManyToOne(() => User)
    @ApiProperty({
        type: () => User,
        description: 'User who created the billing'
    })
    creator: User;

    @ApiProperty({
        type: () => [FileUpload],
        description: 'Array of billing docs',
    })
    @ManyToMany(() => FileUpload)
    @JoinTable({
        name: 'product_images',
    })
    documents: IFileUpload[];
}
