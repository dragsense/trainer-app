
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
  IsDateString,
  IsNotEmpty,
  ValidateNested
} from 'class-validator';
import { EUserGender } from '../../enums/user.enum';
import { Type } from 'class-transformer';
import { FieldOptions, FieldType } from '../../decorators/field.decorator';


class AddressDto {
  @ApiProperty({ example: '123 Main Street, New York' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  address: string;
}


export class CreateProfileDto {

  // ──────── Shared Fields ────────

  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  @FieldType("text", true)
  lastName: string;


  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  @FieldType("text", true)
  phoneNumber?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsOptional()
  @IsDateString()
  @FieldType("date")
  dateOfBirth?: string;

  @ApiProperty({ enum: EUserGender, example: EUserGender.MALE })
  @IsOptional()
  @IsEnum(EUserGender)
  @FieldType("select")
  @FieldOptions(Object.values(EUserGender).map(v => ({ value: v, label: v })))
  gender?: EUserGender;

  @ApiProperty({ example: '123 Main Street, New York' })
  @IsOptional()
  @IsString()
  @FieldType("text")
  address?: string;

  // ──────── Trainer-Specific Fields ────────

  @ApiProperty({ example: '10+ years certified strength coach' })
  @IsOptional()
  @IsString()
  @FieldType("textarea")
  bio?: string;

  @ApiProperty({ example: ['Yoga', 'Crossfit'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @FieldType("multiSelect")
  @FieldOptions([{ value: 'Yoga', label: 'Yoga' }, { value: 'Crossfit', label: 'Crossfit' }])
  specialties?: string[];

  @ApiProperty({ example: 3, description: 'Years of experience', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @FieldType("number")
  experience?: number;



  // ──────── Client-Specific Fields ────────

  @ApiProperty({ example: ['Weight Loss', 'Flexibility'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @FieldType("multiSelect")
  @FieldOptions([{ value: 'Weight Loss', label: 'Weight Loss' }, { value: 'Flexibility', label: 'Flexibility' }])
  fitnessGoals?: string[];


  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Image file',
  })
  @IsOptional()
  @FieldType("file")
  image?: any;


 @ApiPropertyOptional({ type: AddressDto, required: false })
 @ValidateNested()
 @Type(() => AddressDto)
 @FieldType("nestedArray", false, AddressDto)
 @IsArray()
 addresses: AddressDto[];
}


export class UpdateProfileDto extends createPartialType(CreateProfileDto) { }
