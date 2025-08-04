import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateStripeConnectDto {
    @ApiProperty({ 
        example: 'US', 
        description: 'Country code for the Connect account',
        default: 'US'
    })
    @IsString()
    @IsOptional()
    country?: string = 'US';

    @ApiProperty({ 
        example: 'express', 
        description: 'Type of Stripe Connect account',
        enum: ['express', 'standard'],
        default: 'express'
    })
    @IsEnum(['express', 'standard'])
    @IsOptional()
    type?: 'express' | 'standard' = 'express';
}
