import { IsEnum, IsOptional } from 'class-validator';
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus } from '../enums/billing.enum';


export class BillingListDto extends ListQueryDto {
    @ApiProperty({
        example: BillingStatus.PENDING,
        description: 'Status of Billing',
        enum: BillingStatus,
        required: false,
        enumName: 'BillingStatus',
    })
    @IsEnum(BillingStatus)
    @IsOptional()
    status: BillingStatus;
}

