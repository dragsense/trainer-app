import { ApiProperty } from '@nestjs/swagger';
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '../entities/payment-method.entity';

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