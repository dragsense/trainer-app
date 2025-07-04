import { apiRequest } from "@/utils/fetcher";
import {
  AuthUser,
  TLoginData,
  ILoginResponse,
  TSignupData,
  TForgotPasswordData,
  IForgotPasswordResponse,
  TResetPasswordData,
  IResetPasswordResponse
} from "@/@types/auth.type";
import { IMessageResponse } from "@/@types/general.type";

const AUTH_API_PATH = "/auth";

export const me = async () =>
  apiRequest<AuthUser>(`${AUTH_API_PATH}/me`, "GET");

export const login = async (data: TLoginData) =>
  apiRequest<ILoginResponse>(`${AUTH_API_PATH}/login`, "POST", data, undefined);

export const signup = async (data: TSignupData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/signup`, "POST", data, undefined);

export const forgotPassword = async (data: TForgotPasswordData) =>
  apiRequest<IForgotPasswordResponse>(`${AUTH_API_PATH}/forgot-password`, "POST", data, undefined);

export const resetPassword = async (data: TResetPasswordData) =>
  apiRequest<IResetPasswordResponse>(`${AUTH_API_PATH}/reset-password`, "POST", data, undefined);

export const logout = async () =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/logout`, "POST", undefined);
