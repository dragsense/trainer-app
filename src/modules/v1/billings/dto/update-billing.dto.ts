import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateBillingDto } from './create-billing.dto';
import { BillingStatus } from '../enums/billing.enum';
import { IsArray, IsEnum, IsNumber, IsOptional, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBillingDto extends PartialType(CreateBillingDto) { }


export class UpdateBillingStatusDto {
    @ApiProperty({ enum: BillingStatus, description: 'New billing status' })
    @IsEnum(BillingStatus)
    status: BillingStatus;


    @ApiProperty({
        type: "string",
        format: "binary",
        required: false,
        description: "New documents to attach to the billing record",
    })
    @IsOptional()
    @Max(5)
    documents?: any[];

    @ApiProperty({
        type: [Number],
        required: false,
        description: "IDs of existing documents to remove",
        example: [1, 2, 3],
    })
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    removedDocuments?: number[];
}