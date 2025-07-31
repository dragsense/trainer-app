import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationMetaDto } from '@/shared-dto/pagination.dto';
import { Billing } from '../entities/billing.entity';

export class BillingPaginatedDto extends PaginationMetaDto {
    @ApiProperty({ type: () => [Billing] })
    @Type(() => Billing)
    data: Billing[];
}
