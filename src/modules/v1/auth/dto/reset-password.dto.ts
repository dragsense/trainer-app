import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordWithTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token received via email for password reset',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newPass456',
    description: 'New password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
