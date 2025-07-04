
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { UserGender } from '../../enums/user.enum';



export class CreateProfileDto {

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'male', description: 'Gender of the user' })
  @IsEnum(UserGender, { message: 'Gender must be one of Male, Female, or Other' })
  @IsOptional()
  gender: UserGender;

  @ApiProperty({ example: '123 Main St', description: 'Street address' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({
    example: '+1-202-555-0173',
    description: 'Contact phone number',
  })
  @IsString()
  @IsOptional()
  contactPhone: string;
}
