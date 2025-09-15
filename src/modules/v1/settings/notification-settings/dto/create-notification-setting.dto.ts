import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateNotificationSettingDto {
  @ApiProperty({ example: true, description: 'Enable email notifications', default: true })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiProperty({ example: true, description: 'Enable new user notifications', default: true })
  @IsBoolean()
  @IsOptional()
  newUserNotifications?: boolean;

  @ApiProperty({ example: true, description: 'Enable user updates notifications', default: true })
  @IsBoolean()
  @IsOptional()
  userUpdateNotifications?: boolean;

  @ApiProperty({ example: true, description: 'Enable billing notifications', default: true })
  @IsBoolean()
  @IsOptional()
  billingNotifications?: boolean;

  @ApiProperty({ example: true, description: 'Enable session notifications', default: true })
  @IsBoolean()
  @IsOptional()
  sessionNotifications?: boolean;

}
