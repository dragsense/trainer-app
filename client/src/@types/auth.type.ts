import { LoginDto, LoginResponseDto } from "#/modules/v1/auth/dto/login.dto";
import { RegisterDto } from "#/modules/v1/auth/dto/register.dto";
import { ForgotPasswordDto } from "#/modules/v1/auth/dto/forgot-password.dto";
import { ResetPasswordWithTokenDto } from "#/modules/v1/auth/dto/reset-password.dto";

import { IUser } from "./user.type";

export type IAuthUser = IUser | null;

export type TLoginData = {} & LoginDto;

export interface ILoginResponse extends LoginResponseDto {
}

export type TSignupData = {
  confirmPassword: string;
} & RegisterDto;

export type TForgotPasswordData = {
} & ForgotPasswordDto;

export type TResetPasswordData = {
  confirmPassword: string;
} & ResetPasswordWithTokenDto;

