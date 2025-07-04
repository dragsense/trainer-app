// React & Hooks
import React, { createContext, useContext } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
import { TLoginData, TSignupData, TForgotPasswordData, TResetPasswordData, AuthUser } from '@/@types/auth.type';

// Services
import { login, signup, forgotPassword, resetPassword, logout } from '@/services/auth.api';

interface AuthContextType {
  user: AuthUser;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: TSignupData) => Promise<void>;
  forgotPassword: (data: TForgotPasswordData) => Promise<void>;
  resetPassword: (data: TResetPasswordData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const handleLogin = async (data: TLoginData) => {
    try {
      const res = await login(data);
      toast.success(res.message || "Logged in successfully");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      throw err;
    }
  };

  const handleSignup = async (data: TSignupData) => {
    try {
      const res = await signup(data);
      toast.success(res.message || "Signup successful");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      throw err;
    }
  };

  const handleForgotPassword = async (data: TForgotPasswordData) => {
    try {
      const res = await forgotPassword(data);
      toast.success(res.message || "Password reset instructions sent");
    } catch (err) {
      throw err;
    }
  };

  const handleResetPassword = async (data: TResetPasswordData) => {
    try {
      const res = await resetPassword(data);
      toast.success(res.message || "Password reset successful");
    } catch (err) {
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logout();
      toast.success(res.message || "Logged out successfully");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user: queryClient.getQueryData(["me"]) as AuthUser,
    login: handleLogin,
    signup: handleSignup,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a UserProvider");
  }
  return context;
}
