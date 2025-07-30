import { apiRequest } from "@/utils/fetcher";
import {
  IAuthUser,
  TLoginData,
  ILoginResponse,
  TSignupData,
  TForgotPasswordData,
  TResetPasswordData,
} from "@/@types/auth.type";
import { IMessageResponse } from "@/@types/api/response.type";

const AUTH_API_PATH = "/auth";


export const login = async (data: TLoginData) =>
  apiRequest<ILoginResponse>(`${AUTH_API_PATH}/login`, "POST", data, undefined);

export const signup = async (data: TSignupData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/signup`, "POST", data, undefined);

export const forgotPassword = async (data: TForgotPasswordData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/send-reset-link`, "POST", data, undefined);

export const resetPassword = async (data: TResetPasswordData) =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/reset-password`, "POST", data, undefined);

export const logout = async () =>
  apiRequest<IMessageResponse>(`${AUTH_API_PATH}/logout`, "POST", undefined);
