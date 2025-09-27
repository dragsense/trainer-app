import { CreateUserDto, ResetPasswordDto, CreateProfileDto, UpdateProfileDto } from '../dtos';

// Availability imports
import { 
  TimeSlotDto, 
  DayScheduleDto, 
  WeeklyScheduleDto, 
  UnavailablePeriodDto
} from '../dtos';
import { CreateUserAvailabilityDto, UpdateUserAvailabilityDto } from '../dtos';


export type TUserData = CreateUserDto;
export type TProfileData = CreateProfileDto;
export type TUpdateProfileData = UpdateProfileDto;

export type TUserResetPasswordData = ResetPasswordDto;

// Availability Types - using proper backend types
export type TTimeSlot = TimeSlotDto;
export type TDaySchedule = DayScheduleDto;
export type TWeeklySchedule = WeeklyScheduleDto;
export type TUnavailablePeriod = UnavailablePeriodDto;

export type TDayKey = keyof TWeeklySchedule;


export type TCreateUserAvailabilityData = CreateUserAvailabilityDto;
export type TUpdateUserAvailabilityData = UpdateUserAvailabilityDto;
