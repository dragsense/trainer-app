import { User } from "#/modules/v1/users/entities/user.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateUserDto } from "#/modules/v1/users/dto/create-user.dto";
import { ResetPasswordDto } from "#/modules/v1/users/dto/reset-password.dto";
import { Profile } from "#/modules/v1/users/profiles/entities/profile.entity";
import { CreateProfileDto } from "#/modules/v1/users/profiles/dto/create-profile.dto";

// Availability imports
import { UserAvailability } from "#/modules/v1/users/entities/user-availability.entity";
import { 
  TimeSlotDto, 
  DayScheduleDto, 
  WeeklyScheduleDto, 
  UnavailablePeriodDto
} from "#/modules/v1/users/dto/user-availability.dto";
import { CreateUserAvailabilityDto } from "#/modules/v1/users/dto/create-user-availability.dto";
import { UpdateUserAvailabilityDto } from "#/modules/v1/users/dto/update-user-availability.dto";

export interface IUser extends User, GeneralBaseEntity {};
export interface IProfile extends Profile, GeneralBaseEntity {}

export type TUserData = CreateUserDto;
export type TProfileData = CreateProfileDto;
export type TResetPasswordData = ResetPasswordDto;

// Availability Types - using proper backend types
export type TTimeSlot = TimeSlotDto;
export type TDaySchedule = DayScheduleDto;
export type TWeeklySchedule = WeeklyScheduleDto;
export type TUnavailablePeriod = UnavailablePeriodDto;

export interface IUserAvailability extends UserAvailability, GeneralBaseEntity {}

export type TCreateUserAvailabilityData = CreateUserAvailabilityDto;
export type TUpdateUserAvailabilityData = UpdateUserAvailabilityDto;