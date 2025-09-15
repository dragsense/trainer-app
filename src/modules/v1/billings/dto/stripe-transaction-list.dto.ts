import { IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class StripeTransactionListDto {
    @ApiProperty({
        description: 'Search term for transactions',
        example: 'pi_1234567890',
        required: false,
    })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiProperty({
        description: 'Filter by payment intent status',
        example: 'succeeded',
        required: false,
    })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiProperty({
        description: 'Filter by customer ID',
        example: 'cus_1234567890',
        required: false,
    })
    @IsString()
    @IsOptional()
    customerId?: string;

    @ApiProperty({
        description: 'Filter by currency',
        example: 'usd',
        required: false,
    })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiProperty({
        description: 'Minimum transaction amount (in cents)',
        example: 1000,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    minAmount?: number;

    @ApiProperty({
        description: 'Maximum transaction amount (in cents)',
        example: 10000,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    maxAmount?: number;

    @ApiProperty({
        description: 'Filter by payment intent ID',
        example: 'pi_1234567890',
        required: false,
    })
    @IsString()
    @IsOptional()
    paymentIntentId?: string;

    @ApiProperty({
        description: 'Filter by charge ID',
        example: 'ch_1234567890',
        required: false,
    })
    @IsString()
    @IsOptional()
    chargeId?: string;

    @ApiProperty({
        description: 'Filter by created date (from)',
        example: '2024-01-01',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    createdDateFrom?: string;

    @ApiProperty({
        description: 'Filter by created date (to)',
        example: '2024-12-31',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    createdDateTo?: string;

    @ApiProperty({
        description: 'Filter by captured date (from)',
        example: '2024-01-01',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    capturedDateFrom?: string;

    @ApiProperty({
        description: 'Filter by captured date (to)',
        example: '2024-12-31',
        required: false,
    })
    @IsDateString()
    @IsOptional()
    capturedDateTo?: string;

    @ApiProperty({
        description: 'Number of results to return',
        example: 100,
        required: false,
        default: 100,
    })
    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 100;
}
