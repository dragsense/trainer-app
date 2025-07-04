import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './create-payment-method.dto';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {
  @ApiPropertyOptional({
    description: 'Active status of the payment method',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;
}
