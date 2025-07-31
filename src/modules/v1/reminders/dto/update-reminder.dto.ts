import { CreateReminderDto } from './create-reminder.dto';
import { IsOptional, IsEnum, IsDate, IsNumber, IsString, IsArray, ArrayNotEmpty, IsPositive, IsBoolean } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ReminderType, ReminderStatus } from '../enums/reminder.enum';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
}
