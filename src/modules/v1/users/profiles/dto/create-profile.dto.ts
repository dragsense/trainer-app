
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  IsEmail,
  Min,
  Max
} from 'class-validator';
import { UserGender } from '../../enums/user.enum';

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

  @ApiProperty({ example: ['ACE Certified', 'NASM CPT'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ example: ['Zone A', 'Zone B'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availabilityZones?: string[];

  @ApiProperty({ example: ['Mon 9-11', 'Wed 3-5'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableTimeSlots?: string[];

  @ApiProperty({ example: 5, minimum: 0, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 3, description: 'Years of experience', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
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

  @ApiProperty({ example: ['Morning', 'Evening'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredWorkoutTimes?: string[];
}
