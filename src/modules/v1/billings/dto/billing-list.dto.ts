import { IsEnum, IsOptional, IsNumber, IsString, IsDateString, Min, Max } from 'class-validator';
import { ListQueryDto } from '@/shared-dto/list-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
    status?: BillingStatus;

    @ApiProperty({
        description: 'Filter by user ID',
        example: 1,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    userId?: number;

    @ApiProperty({
        description: 'Filter by invoice type',
        example: 'SESSION',
        required: false,
    })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({
        description: 'Filter by currency',
        example: 'USD',
        required: false,
    })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({
        description: 'Minimum invoice amount (in cents)',
        example: 1000,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    minAmount?: number;

    @ApiProperty({
        description: 'Maximum invoice amount (in cents)',
        example: 10000,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    maxAmount?: number;

    @ApiProperty({
        description: 'Filter by issue date (from)',
        example: '2024-01-01',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    issueDateFrom?: string;

    @ApiProperty({
        description: 'Filter by issue date (to)',
        example: '2024-12-31',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    issueDateTo?: string;

    @ApiProperty({
        description: 'Filter by due date (from)',
        example: '2024-01-01',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    dueDateFrom?: string;

    @ApiProperty({
        description: 'Filter by due date (to)',
        example: '2024-12-31',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    dueDateTo?: string;

    @ApiProperty({
        description: 'Filter by paid date (from)',
        example: '2024-01-01',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    paidDateFrom?: string;

    @ApiProperty({
        description: 'Filter by paid date (to)',
        example: '2024-12-31',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    paidDateTo?: string;

    @ApiProperty({
        description: 'Filter by Stripe invoice ID',
        example: 'in_1234567890',
        required: false,
    })
    @IsString()
    @IsOptional()
    stripeInvoiceId?: string;

    @ApiProperty({
        description: 'Filter by local invoice number',
        example: 'INV-2024-001',
        required: false,
    })
    @IsString()
    @IsOptional()
    localInvoiceNumber?: string;
}