// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { 
  ISettings, 
  IAppSetting, 
  INotificationSetting, 
  IProfile, 
  IPaymentMethod,
  TAppSettingData,
  TUpdateAppSettingData,
  TPaymentMethodData,
  TUpdatePaymentMethodData,
  TProfileData
} from "@/@types/setting.type";

// Constants
const SETTINGS_API_PATH = "/settings";
const APP_SETTINGS_API_PATH = `${SETTINGS_API_PATH}/app-setting`;
const NOTIFICATION_SETTINGS_API_PATH = `${SETTINGS_API_PATH}/notification-settings`;
const PAYMENT_METHODS_API_PATH = `${SETTINGS_API_PATH}/payment-methods`;
const PROFILES_API_PATH = "/users/profiles";

// App Settings
export const fetchAppSettings = () =>
  apiRequest<IAppSetting>(`${APP_SETTINGS_API_PATH}`, "GET");

export const createAppSettings = (data: TAppSettingData) =>
  apiRequest<IAppSetting>(`${APP_SETTINGS_API_PATH}`, "POST", data);

export const updateAppSettings = (data: TUpdateAppSettingData) =>
  apiRequest<IMessageResponse>(`${APP_SETTINGS_API_PATH}`, "PATCH", data);

// Notification Settings
export const fetchNotificationSettings = () =>
  apiRequest<INotificationSetting>(`${NOTIFICATION_SETTINGS_API_PATH}`, "GET");

export const updateNotificationSettings = (data: Partial<INotificationSetting>) =>
  apiRequest<IMessageResponse>(`${NOTIFICATION_SETTINGS_API_PATH}`, "PATCH", data);

// Profile Settings
export const fetchProfile = () =>
  apiRequest<IProfile>(`${PROFILES_API_PATH}/profile/me`, "GET");

export const updateProfile = (data: Partial<TProfileData>) =>
  apiRequest<IMessageResponse>(`${PROFILES_API_PATH}/profile/me`, "PATCH", data);

// Payment Methods
export const fetchPaymentMethods = () =>
  apiRequest<IPaymentMethod[]>(`${PAYMENT_METHODS_API_PATH}`, "GET");

export const fetchPaymentMethodsList = (
  params: IListParams
) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  if (
    params.filters &&
    typeof params.filters === "object" &&
    Object.keys(params.filters).length > 0
  ) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  return apiRequest<IPaginatedResponse<IPaymentMethod>>(
    `${PAYMENT_METHODS_API_PATH}?${queryParams.toString()}`,
    "GET"
  );
};

export const fetchPaymentMethod = (id: number) =>
  apiRequest<IPaymentMethod>(`${PAYMENT_METHODS_API_PATH}/${id}`, "GET");

export const createPaymentMethod = (data: TPaymentMethodData) =>
  apiRequest<IPaymentMethod>(`${PAYMENT_METHODS_API_PATH}`, "POST", data);

export const updatePaymentMethod = (id: number) => (data: Partial<TUpdatePaymentMethodData>) =>
  apiRequest<IMessageResponse>(`${PAYMENT_METHODS_API_PATH}/${id}`, "PATCH", data);

export const deletePaymentMethod = (id: number) =>
  apiRequest<IMessageResponse>(`${PAYMENT_METHODS_API_PATH}/${id}`, "DELETE");

// Combined Settings
export const fetchAllSettings = async (): Promise<ISettings> => {
  const [profile, notifications, paymentMethods, appSetting] = await Promise.all([
    fetchProfile(),
    fetchNotificationSettings(),
    fetchPaymentMethods(),
    fetchAppSettings(),
  ]);

  return {
    profile,
    notifications,
    paymentMethods,
    appSetting,
  };
};

// Security API
export const changePassword = (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => 
  apiRequest<IMessageResponse>("/auth/change-password", "PUT", data);
