import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

export class CreateStripeSessionDto {
  @IsString()
  productName: string;

  @IsNumber()
  amount: number;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;        
}
