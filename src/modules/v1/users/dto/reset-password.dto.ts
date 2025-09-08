import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'currentPass123',
    description: 'Current Password password (min 6 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  currentPassword?: string;


   @ApiProperty({
    example: 'newPass456',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
