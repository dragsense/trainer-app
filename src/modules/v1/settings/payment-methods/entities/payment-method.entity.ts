import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodType } from '../enums/payment-method-type.enum';
import { Billing } from '@/modules/v1/billings/entities/billing.entity';

@Entity({ name: 'payment_methods' })
export class PaymentMethod {
    @ApiProperty({ example: 1, description: 'Unique identifier' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        enum: PaymentMethodType,
        example: PaymentMethodType.STRIPE,
        description: 'Payment method type'
    })
    @Column({
        type: 'enum',
        enum: PaymentMethodType,
        unique: true
    })
    key: PaymentMethodType;

    @ApiProperty({ example: 'Stripe', description: 'Display name of the payment method' })
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @ApiProperty({
        example: {
            type: 'object',
            properties: {
                publishableKey: { type: 'string', title: 'Publishable Key' },
                secretKey: { type: 'string', title: 'Secret Key' }
            },
            required: ['publishableKey', 'secretKey']
        },
        description: 'JSON schema for configuration fields',
        required: false
    })
    @Column({ type: 'json', nullable: true })
    configSchema: Record<string, any> | null;

    // Add these new columns
    @ApiProperty({ example: true, description: 'Whether this payment method is enabled' })
    @Column({ type: 'boolean', default: false })
    isEnabled: boolean;

    @ApiProperty({
        example: {
            publishableKey: 'pk_test_...',
            secretKey: 'sk_test_...'
        },
        description: 'Configuration data for the payment method',
        required: false
    })
    @Column({ type: 'json', nullable: true, select: false })
    config: Record<string, any> | null;



    @OneToMany(() => Billing, (billing: Billing) => billing.paymentMethod)
    @ApiProperty({
        type: () => [Billing],
        description: 'Billing set for this paymentMethod'
    })
    billings: Billing[];


    @ApiProperty({ example: '2025-06-13T10:00:00.000Z', description: 'Date when the record was created' })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @ApiProperty({ example: '2025-06-13T12:00:00.000Z', description: 'Date when the record was last updated' })
    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
} 