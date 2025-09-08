
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  Min,
  Max
} from 'class-validator';
import { UserGender } from '../../enums/user.enum';
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
  @IsDate()
  dateOfBirth?: Date;

  @ApiProperty({ enum: UserGender, example: UserGender.MALE })
  @IsOptional()
  @IsEnum(UserGender)
  gender?: UserGender;

  @ApiProperty({ example: '123 Main Street, New York' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

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

  @ApiProperty({ example: 5, minimum: 0, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 3, description: 'Years of experience', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  experience?: number;



  // ──────── Client-Specific Fields ────────

  @ApiProperty({ example: ['Weight Loss', 'Flexibility'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fitnessGoals?: string[];

  @ApiProperty({ example: UserGender.FEMALE, description: 'Preferred trainer gender', required: false })
  @IsOptional()
  @IsEnum(UserGender)
  preferredTrainerGender?: UserGender;


  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Image file',
  })
  @IsOptional()
  image?: any;
}
