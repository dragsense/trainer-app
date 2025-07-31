import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillingStatus, BillingType, BillingCurrency } from '../enums/billing.enum';

class LineItemDto {
  @ApiProperty({ example: 'Consulting Session', description: 'Description of the line item' })
  @IsString()
  description: string;

  @ApiProperty({ example: 1, description: 'Quantity of the item' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 10000, description: 'Unit price in cents' })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 10000, description: 'Total amount (quantity × unitPrice)' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 0, description: 'Tax amount for this item' })
  @IsOptional()
  @IsNumber()
  tax?: number;
}

export class CreateBillingDto {
  @ApiProperty({ example: 'in_1234567890', description: 'Stripe Invoice ID' })
  @IsOptional()
  @IsString()
  stripeInvoiceId?: string;

  @ApiProperty({ enum: BillingType, example: BillingType.INDIVIDUAL })
  @IsNotEmpty()
  @IsEnum(BillingType)
  type: BillingType;

  @ApiProperty({ enum: BillingStatus, example: BillingStatus.PENDING })
  @IsOptional()
  @IsEnum(BillingStatus)
  status?: BillingStatus;

  @ApiProperty({ example: 1000, description: 'Invoice amount in cents' })
  @IsOptional()
  @IsNumber()
  invoiceAmount?: number;

  @ApiProperty({ enum: BillingCurrency, example: BillingCurrency.USD })
  @IsOptional()
  @IsEnum(BillingCurrency)
  currency?: BillingCurrency;

  @ApiProperty({ example: 101, description: 'User ID' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 55, description: 'Session ID if applicable' })
  @IsOptional()
  @IsNumber()
  sessionId?: number;


  @ApiProperty({ example: '2025-07-01', description: 'Invoice issue date' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiProperty({ example: '2025-07-15', description: 'Invoice due date' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Line items for the invoice',
    type: [LineItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems?: LineItemDto[];

  @ApiProperty({ example: 2000, description: 'Total tax amount (in cents)' })
  @IsOptional()
  @IsNumber()
  totalTax?: number;

  @ApiProperty({ example: 500, description: 'Total discount (in cents)' })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: 10500, description: 'Final total amount (in cents)' })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 'Thank you for your business!', description: 'Optional invoice note' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Net 14', description: 'Payment terms like Net 30, Net 14' })
  @IsOptional()
  @IsString()
  terms?: string;
}
