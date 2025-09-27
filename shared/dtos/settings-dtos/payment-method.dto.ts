import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { EPaymentMethodType } from '../../enums';
import { PaymentMethod } from '../../entities/settings/payment-method.entity';
import { Type } from 'class-transformer';
import { ListQueryDto, PaginationMetaDto } from '../common';

export class CreatePaymentMethodDto {
  @ApiProperty({
    enum: EPaymentMethodType,
    example: EPaymentMethodType.STRIPE,
    description: 'Payment method type'
  })
  @IsEnum(EPaymentMethodType)
  key: EPaymentMethodType;

  @ApiProperty({ example: 'Stripe', description: 'Display name of the payment method' })
  @IsString()
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
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;

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
  @IsObject()
  config?: Record<string, any>;
}

export class UpdatePaymentMethodDto {
  @ApiProperty({ example: 'Stripe', description: 'Display name of the payment method' })
  @IsString()
  @IsOptional()
  name?: string;

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
  @IsOptional()
  @IsObject()
  configSchema?: Record<string, any>;

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
  @IsObject()
  config?: Record<string, any>;
}


export class PaymentMethodListDto extends ListQueryDto<PaymentMethod> {
  @ApiProperty({ example: 'stripe', description: 'Filter by payment method key', required: false })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ example: 'Stripe', description: 'Filter by payment method name', required: false })
  @IsOptional()
  @IsString()
  name?: string;
} 


export class PaymentMethodPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [PaymentMethod] })
  @Type(() => PaymentMethod)
  data: PaymentMethod[]
}   