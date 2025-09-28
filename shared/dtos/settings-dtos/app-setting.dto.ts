import { ApiProperty } from '@nestjs/swagger';
import { PartialType, createPartialType } from '../../lib/omit-type';
import { IsBoolean, IsOptional } from 'class-validator';

export class CreateAppSettingDto {
  @ApiProperty({ example: true, description: 'Allow Notification', default: true })
  @IsBoolean()
  @IsOptional()
  allowNotification?: boolean;
}

export class UpdateAppSettingDto extends createPartialType(CreateAppSettingDto) {
}