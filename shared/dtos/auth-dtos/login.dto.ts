import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserWithProfileSafeDto } from '../user-dtos';


export class LoginDto {
    @ApiProperty({ example: 'email@example.com', description: 'User email' })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    email: string;

    @ApiProperty({ example: 'secrete', description: 'User password' })
    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    password: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: () => UserWithProfileSafeDto })
  user: UserWithProfileSafeDto;

  @ApiProperty()
  token: string;

  @ApiProperty()
  message: string;
}
