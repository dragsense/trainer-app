import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBillingDto } from './create-billing.dto';
import { BillingStatus } from '../enums/billing.enum';
import { IsEnum } from 'class-validator';

export class UpdateBillingDto extends PartialType(CreateBillingDto) { }


export class UpdateBillingStatusDto {
    @ApiProperty({ enum: BillingStatus, description: 'New billing status' })
    @IsEnum(BillingStatus)
    status: BillingStatus;
}