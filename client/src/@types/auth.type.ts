import { User } from "./user.type";

export type AuthUser = Omit<User, "createdAt" | "updatedAt"> | null;

export type TLoginData = {
  email: string;
  password: string;
};

export interface ILoginResponse {
  user: User;
  token: string;
  message: string;
}

export type TSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type TForgotPasswordData = {
  email: string;
};

export type TResetPasswordData = {
  password: string;
  confirmPassword: string;
};

export interface IForgotPasswordResponse {
  message: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export type TForgotPasswordFormValues = TForgotPasswordData;
export type TResetPasswordFormValues = TResetPasswordData;

