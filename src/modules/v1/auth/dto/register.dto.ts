import {
    IsString,
    IsNotEmpty,
    IsEmail,
    Length,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class RegisterDto {

    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({ example: 'email@example.com' })
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @ApiProperty({ example: 'secrete' })
    @IsString()
    @IsNotEmpty()
    @Length(6, 100)
    password: string;
  }
  