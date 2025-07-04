import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsPositive, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentType } from '../enums/payment-type.enum';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Amount of the payment',
    example: 100.50,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Currency of the payment',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @ApiProperty({
    description: 'Payment type',
    enum: PaymentType,
    example: PaymentType.SESSION,
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    description: 'Payment reference or transaction ID',
    example: 'PAY-123456789',
  })
  @IsString()
  @IsNotEmpty()
  reference: string;

  @ApiProperty({
    description: 'Payment method ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  paymentMethodId: number;

  @ApiProperty({
    description: 'Notes or description about the payment',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Metadata about the payment',
    example: { sessionId: '123', packageId: '456' },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Date and time when the payment was processed',
  })
  @IsOptional()
  processedAt?: Date;

  @ApiProperty({
    description: 'Payment receipt URL',
  })
  @IsOptional()
  @IsUrl()
  receiptUrl?: string;

  @ApiProperty({
    description: 'Payment receipt number',
  })
  @IsOptional()
  @IsString()
  receiptNumber?: string;
}
