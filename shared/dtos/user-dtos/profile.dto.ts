
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType, createPartialType } from '../../lib/omit-type';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  Min,
  Max,
  IsDateString
} from 'class-validator';
import { EUserGender } from '../../enums/user.enum';
import { Type } from 'class-transformer';

export class CreateProfileDto {

  // ──────── Shared Fields ────────

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;


  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiProperty({ enum: EUserGender, example: EUserGender.MALE })
  @IsOptional()
  @IsEnum(EUserGender)
  gender?: EUserGender;

  @ApiProperty({ example: '123 Main Street, New York' })
  @IsOptional()
  @IsString()
  address?: string;

  // ──────── Trainer-Specific Fields ────────

  @ApiProperty({ example: '10+ years certified strength coach' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: ['Yoga', 'Crossfit'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({ example: 3, description: 'Years of experience', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  experience?: number;



  // ──────── Client-Specific Fields ────────

  @ApiProperty({ example: ['Weight Loss', 'Flexibility'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fitnessGoals?: string[];


  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Image file',
  })
  @IsOptional()
  image?: any;
}


export class UpdateProfileDto extends createPartialType(CreateProfileDto) { }
