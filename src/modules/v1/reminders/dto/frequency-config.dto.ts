import { IsNotEmpty, IsEnum, IsNumber, IsString, IsArray, ArrayNotEmpty, IsPositive, Matches, Min, Max, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReminderFrequency } from '../enums/reminder.enum';




export class FrequencyConfigDto {
    @ApiPropertyOptional({
        description: 'Interval in minutes for DAILY reminders when no specific time is set',
        example: 30,
    })
    @ValidateIf((o) => o.frequency === ReminderFrequency.DAILY && !o.timeOfDay)
    @IsNumber()
    @IsPositive()
    intervalMinutes?: number;

    @ApiPropertyOptional({
        description: 'Selected weekdays for WEEKLY frequency (0 = Sunday, 6 = Saturday)',
        example: [1, 3, 5],
    })
    @ValidateIf((o) => o.frequency === ReminderFrequency.WEEKLY)
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    @Min(0, { each: true })
    @Max(6, { each: true })
    weekdays?: number[];

    @ApiPropertyOptional({
        description: 'Selected days of month for MONTHLY frequency',
        example: [1, 15, 28],
    })
    @ValidateIf((o) => o.frequency === ReminderFrequency.MONTHLY)
    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, { each: true })
    @Min(1, { each: true })
    @Max(31, { each: true })
    monthDays?: number[];

    @ApiPropertyOptional({
        description: 'Specific time of day for DAILY/WEEKLY/MONTHLY frequency (HH:mm)',
        example: '09:00',
    })
    @ValidateIf((o) =>
        [ReminderFrequency.DAILY, ReminderFrequency.WEEKLY, ReminderFrequency.MONTHLY].includes(o.frequency)
    )
    @IsString()
    @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Time of day must be in HH:mm format',
    })
    timeOfDay?: string;

    @ApiProperty({
        description: 'Frequency of the reminder',
        enum: ReminderFrequency,
        example: ReminderFrequency.DAILY,
    })
    @IsNotEmpty()
    @IsEnum(ReminderFrequency)
    frequency: ReminderFrequency;
}