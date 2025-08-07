import { ADMIN_ROUTES } from "@/config/routes.config";
import { SettingsLayout } from "@/layouts";
import {  Navigate } from "react-router-dom";

export default function SettingsPage() {
  return (
    <SettingsLayout />
  );
}

// Default redirect to profile settings
export function SettingsIndexPage() {
  return <Navigate to={ADMIN_ROUTES.SETTINGS_PROFILE} replace />;
}