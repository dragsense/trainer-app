import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateAppSettingDto {
  @ApiProperty({ 
    example: true, 
    description: 'Allow notifications for the user', 
    default: true 
  })
  @IsBoolean()
  @IsOptional() 
  allowNotification?: boolean;
}