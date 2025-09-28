import { ApiProperty } from '@nestjs/swagger';
import { PartialType, createPartialType } from '../../lib/omit-type';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsDateString,
  ArrayMinSize,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EBillingStatus, EBillingType, EBillingCurrency } from '../../enums/billing.enum';
import { EPaymentMethodType } from '../../enums/payment-method.enum';
import { ListQueryDto } from '../common/list-query.dto';
import { PaginationMetaDto } from '../common/pagination.dto';
import { Billing } from '../../entities/billings/billing.entity';

@ValidatorConstraint({ name: 'amountCalculation', async: false })
export class AmountCalculationConstraint implements ValidatorConstraintInterface {
  validate(amount: number, args: ValidationArguments) {
    const object = args.object as any;
    const expectedAmount = object.quantity * object.unitPrice;
    return amount === expectedAmount;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    const expectedAmount = object.quantity * object.unitPrice;
    return `Amount must equal quantity × unitPrice (${expectedAmount})`;
  }
}

@ValidatorConstraint({ name: 'futureDate', async: false })
export class FutureDateConstraint implements ValidatorConstraintInterface {
  validate(date: Date, args: ValidationArguments) {
    if (!date) return true; // Optional field, so empty is valid
    return new Date(date) > new Date();
  }

  defaultMessage(args: ValidationArguments) {
    return 'Due date must be in the future';
  }
}

export class LineItemDto {
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
  @Min(0)
  @IsNumber()
  @Validate(AmountCalculationConstraint)
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

  @ApiProperty({ enum: EBillingType, example: EBillingType.INDIVIDUAL })
  @IsNotEmpty()
  @IsEnum(EBillingType)
  type: EBillingType;

  @ApiProperty({ enum: EBillingStatus, example: EBillingStatus.PENDING })
  @IsOptional()
  @IsEnum(EBillingStatus)
  status?: EBillingStatus;

  @ApiProperty({ example: 1000, description: 'Invoice amount in cents' })
  @IsOptional()
  @IsNumber()
  invoiceAmount?: number;

  @ApiProperty({ enum: EBillingCurrency, example: EBillingCurrency.USD })
  @IsOptional()
  @IsEnum(EBillingCurrency)
  currency?: EBillingCurrency;

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
  issueDate?: Date;

  @ApiProperty({ example: '2025-07-15', description: 'Invoice due date' })
  @IsOptional()
  @IsDateString()
  @Validate(FutureDateConstraint)
  dueDate?: Date;

  @ApiProperty({
    description: 'Line items for the invoice',
    type: [LineItemDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one line item is required' })
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems: LineItemDto[];

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

  @ApiProperty({
    enum: EPaymentMethodType,
    example: EPaymentMethodType.STRIPE,
    description: 'Payment method type'
  })
  @IsEnum(EPaymentMethodType)
  paymentMethodType: EPaymentMethodType;
}

export class UpdateBillingDto extends createPartialType(CreateBillingDto) {}

export class UpdateBillingStatusDto {
  @ApiProperty({ enum: EBillingStatus, example: EBillingStatus.PAID })
  @IsEnum(EBillingStatus)
  status: EBillingStatus;

  @ApiProperty({ required: false, example: ['doc1.pdf', 'doc2.pdf'] })
  @IsOptional()
  @IsArray()
  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true })
  @Type(() => Number)
  removedDocuments?: number[];
}

// List and query DTOs
export class BillingListDto extends ListQueryDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @ApiProperty({ enum: EBillingStatus, required: false })
  @IsOptional()
  @IsEnum(EBillingStatus)
  status?: EBillingStatus;

  @ApiProperty({ enum: EBillingType, required: false })
  @IsOptional()
  @IsEnum(EBillingType)
  type?: EBillingType;

  @ApiProperty({ enum: EBillingCurrency, required: false })
  @IsOptional()
  @IsEnum(EBillingCurrency)
  currency?: EBillingCurrency;

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAmount?: number;

  @ApiProperty({ required: false, example: 10000 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxAmount?: number;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  issueDateFrom?: Date;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  issueDateTo?: Date;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: Date;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  dueDateTo?: Date;

  @ApiProperty({ required: false, example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  paidDateFrom?: Date;

  @ApiProperty({ required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  paidDateTo?: Date;

  @ApiProperty({ required: false, example: 'in_1234567890' })
  @IsOptional()
  @IsString()
  stripeInvoiceId?: string;

  @ApiProperty({ required: false, example: 'INV-001' })
  @IsOptional()
  @IsString()
  localInvoiceNumber?: string;
}

export class StripeInvoiceListDto extends ListQueryDto {
  @ApiProperty({ required: false, example: 'cus_1234567890' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, example: 'paid' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class StripeTransactionListDto extends ListQueryDto {
  @ApiProperty({ required: false, example: 'cus_1234567890' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, example: 'succeeded' })
  @IsOptional()
  @IsString()
  status?: string;
}


export class BillingPaginatedDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [Billing] })
  @Type(() => Billing)
  data: Billing[]
}