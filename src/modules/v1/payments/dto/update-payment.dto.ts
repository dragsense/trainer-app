import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { IsOptional, IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
  @ApiPropertyOptional({
    description: 'Payment status',
    enum: PaymentStatus,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment type',
    enum: PaymentType,
  })
  @IsOptional()
  @IsEnum(PaymentType)
  type?: PaymentType;

  @ApiPropertyOptional({
    description: 'Payment reference or transaction ID',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Payment method ID',
  })
  @IsOptional()
  @IsNumber()
  paymentMethodId?: number;

  @ApiPropertyOptional({
    description: 'Notes or description about the payment',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Metadata about the payment',
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Date and time when the payment was processed',
  })
  @IsOptional()
  processedAt?: Date;

  @ApiPropertyOptional({
    description: 'Date and time when the payment was refunded',
  })
  @IsOptional()
  refundedAt?: Date;

  @ApiPropertyOptional({
    description: 'Amount refunded if the payment was partially refunded',
  })
  @IsOptional()
  @IsNumber()
  refundedAmount?: number;

  @ApiPropertyOptional({
    description: 'External provider response data',
  })
  @IsOptional()
  providerResponse?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Payment gateway transaction ID',
  })
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Payment receipt URL',
  })
  @IsOptional()
  @IsUrl()
  receiptUrl?: string;

  @ApiPropertyOptional({
    description: 'Payment receipt number',
  })
  @IsOptional()
  @IsString()
  receiptNumber?: string;
}
