import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsArray, ValidateNested, IsOptional, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { DayScheduleDto, UnavailablePeriodDto } from './user-availability.dto';

export class CreateUserAvailabilityDto {
  @ApiProperty({
    description: 'Weekly schedule for the user',
    type: Object,
    example: {
      monday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
      tuesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
      wednesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
      thursday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
      friday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
      saturday: { enabled: false, timeSlots: [] },
      sunday: { enabled: false, timeSlots: [] },
    }
  })
  @IsNotEmpty()
  @IsObject()
  weeklySchedule: {
    monday: DayScheduleDto;
    tuesday: DayScheduleDto;
    wednesday: DayScheduleDto;
    thursday: DayScheduleDto;
    friday: DayScheduleDto;
    saturday: DayScheduleDto;
    sunday: DayScheduleDto;
  };

  @ApiProperty({
    description: 'List of unavailable periods',
    type: [UnavailablePeriodDto],
    required: false,
    example: [
      {
        startDate: '2025-08-10',
        endDate: '2025-08-15',
        reason: 'Vacation'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnavailablePeriodDto)
  @ArrayMaxSize(10)
  unavailablePeriods?: UnavailablePeriodDto[];
}
