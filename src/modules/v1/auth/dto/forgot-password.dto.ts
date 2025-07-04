import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'Registered user email' })
  @IsEmail()
  email: string;
}
