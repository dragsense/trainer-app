import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { PaginationMetaDto } from '@/shared-dto/pagination.dto';
import { PaymentMethod } from '../entities/payment-method.entity';



export class PaymentMethodPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [PaymentMethod] })
  @Type(() => PaymentMethod)
  data: PaymentMethod[];
}
