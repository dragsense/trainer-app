// Utils
import { apiRequest } from "@/utils/fetcher";

// Types
import { IMessageResponse, IPaginatedResponse } from "@/@types/api/response.type";
import { IListParams } from "@/@types/api/param.type";
import { 
  IAppSetting, 
  INotificationSetting, 
  IPaymentMethod,
  TAppSettingData,
  TPaymentMethodData,
  TUpdatePaymentMethodData,
  TNotificationSettingData,
  IStripeConnectStatus,
  TCreateStripeConnectData,
  IStripeConnectCreateResponse,
  IStripeConnectDeleteResponse,

} from "@/@types/setting.type";

// Constants
const SETTINGS_API_PATH = "/settings";
const APP_SETTINGS_API_PATH = `${SETTINGS_API_PATH}/app-setting`;
const NOTIFICATION_SETTINGS_API_PATH = `${SETTINGS_API_PATH}/notification-settings`;
const PAYMENT_METHODS_API_PATH = `${SETTINGS_API_PATH}/payment-methods`;


// App Settings
export const fetchAppSettings = () =>
  apiRequest<IAppSetting>(`${APP_SETTINGS_API_PATH}`, "GET");

export const createAppSettings = (data: TAppSettingData) =>
  apiRequest<IAppSetting>(`${APP_SETTINGS_API_PATH}`, "POST", data);

export const updateAppSettings = (data: Partial<TAppSettingData>) =>
  apiRequest<IMessageResponse>(`${APP_SETTINGS_API_PATH}`, "PATCH", data);

// Notification Settings
export const fetchNotificationSettings = () =>
  apiRequest<INotificationSetting>(`${NOTIFICATION_SETTINGS_API_PATH}`, "GET");

export const updateNotificationSettings = (data: Partial<TNotificationSettingData>) =>
  apiRequest<IMessageResponse>(`${NOTIFICATION_SETTINGS_API_PATH}`, "PATCH", data);

// Profile Settings

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

export const updatePaymentMethod = (id: number) => (data: TUpdatePaymentMethodData) =>
  apiRequest<IMessageResponse>(`${PAYMENT_METHODS_API_PATH}/${id}`, "PATCH", data);

export const toggleEnabledPaymentMethod = (id: number)  =>
  apiRequest<IMessageResponse>(`${PAYMENT_METHODS_API_PATH}/${id}/toggle`, "PATCH", {});

// Stripe Connect
const STRIPE_CONNECT_API_PATH = `${SETTINGS_API_PATH}/stripe-connect`;

export const getStripeConnectStatus = () =>
  apiRequest<IStripeConnectStatus>(`${STRIPE_CONNECT_API_PATH}`, "GET");

export const createStripeConnect = (data: TCreateStripeConnectData) =>
  apiRequest<IStripeConnectCreateResponse>(`${STRIPE_CONNECT_API_PATH}`, "POST", data);

export const deleteStripeConnect = () =>
  apiRequest<IStripeConnectDeleteResponse>(`${STRIPE_CONNECT_API_PATH}`, "DELETE");
