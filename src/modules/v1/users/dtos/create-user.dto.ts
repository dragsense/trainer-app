import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Length
} from 'class-validator';
import {
  ApiProperty
} from '@nestjs/swagger';

export class CreateUserDto {


  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'email@example.com', description: 'User email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'secrete', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

}
