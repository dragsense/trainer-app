import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { SettingsCommonStatus } from '../../common-enums/settings-common.enum';
import { PaymentMethodType } from '../enums/payment-method-type.enum';

export class CreatePaymentMethodDto {
    @ApiProperty({ 
        enum: PaymentMethodType, 
        example: PaymentMethodType.STRIPE, 
        description: 'Payment method type' 
    })
    @IsEnum(PaymentMethodType)
    @IsNotEmpty()
    key: PaymentMethodType;

    @ApiProperty({ example: 'Stripe', description: 'Display name of the payment method' })
    @IsOptional()
    name?: string;

    @ApiProperty({ example: true, description: 'Whether this payment method is enabled' })
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;

    @ApiProperty({ 
        example: {
            publishableKey: 'pk_test_...',
            secretKey: 'sk_test_...'
        },
        description: 'Configuration data for the payment method',
        required: false
    })
    @IsOptional()
    config?: Record<string, any>;

    @ApiProperty({ enum: SettingsCommonStatus, default: SettingsCommonStatus.ACTIVE })
    @IsEnum(SettingsCommonStatus)
    @IsOptional()
    status?: SettingsCommonStatus;
} 