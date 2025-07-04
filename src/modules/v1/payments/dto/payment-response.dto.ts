import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../entities/payment.entity';
import { PaginationMetaDto } from '@/shared-dto/pagination.dto';
import { Type } from 'class-transformer';


export class PaymentPaginatedDto extends PaginationMetaDto {
    @ApiProperty({ type: () => [Payment] })
    @Type(() => Payment)
    data: Payment[];
}