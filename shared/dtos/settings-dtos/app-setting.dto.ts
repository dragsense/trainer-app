import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateAppSettingDto {
  @ApiProperty({ example: true, description: 'Allow Notification', default: true })
  @IsBoolean()
  @IsOptional()
  allowNotification?: boolean;
}

export class UpdateAppSettingDto extends PartialType(CreateAppSettingDto) {
}