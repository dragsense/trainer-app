import { IsNotEmpty, IsEnum, IsOptional, IsNumber, IsArray, IsString, ArrayMinSize, ArrayUnique } from 'class-validator';
import { PaymentMethodType } from '../enums/payment-method.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Name of the payment method',
    example: 'PayPal',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Type of payment method',
    enum: PaymentMethodType,
    example: PaymentMethodType.ONLINE,
  })
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @ApiProperty({
    description: 'Configuration details for the payment method',
    example: { apiKey: 'your-api-key', environment: 'sandbox' },
  })
  @IsOptional()
  configuration?: Record<string, any>;

  @ApiProperty({
    description: 'Description or notes about the payment method',
    example: 'PayPal integration for online payments',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Maximum amount allowed for this payment method',
    example: 10000,
  })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;

  @ApiProperty({
    description: 'Minimum amount allowed for this payment method',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @ApiProperty({
    description: 'Currency codes supported by this payment method',
    example: ['USD', 'EUR'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  supportedCurrencies?: string[];
}
