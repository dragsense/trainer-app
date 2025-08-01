import { SettingsLayout } from "@/layouts";
import { Outlet, Navigate } from "react-router-dom";

export default function SettingsPage() {
  return (
    <SettingsLayout>
      <Outlet />
    </SettingsLayout>
  );
}

// Default redirect to profile settings
export function SettingsIndexPage() {
  return <Navigate to="/admin/settings/profile" replace />;
}