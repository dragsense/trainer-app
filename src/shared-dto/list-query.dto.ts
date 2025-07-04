import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}


export class ListQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;
  
    @IsOptional()
    @IsDateString()
    createdAfter?: string;
  
    @IsOptional()
    @IsDateString()
    createdBefore?: string;
  
    @IsOptional()
    @IsDateString()
    updatedAfter?: string;
  
    @IsOptional()
    @IsDateString()
    updatedBefore?: string;
  }