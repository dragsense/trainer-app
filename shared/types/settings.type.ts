
import { 
  CreateAppSettingDto, 
  UpdateAppSettingDto,
  CreateNotificationSettingDto,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  CreateStripeConnectDto,
} from "../dtos/settings-dtos";

// Data types for API calls
export type TAppSettingData = CreateAppSettingDto;
export type TUpdateAppSettingData = UpdateAppSettingDto;
export type TNotificationSettingData = CreateNotificationSettingDto;
export type TPaymentMethodData = CreatePaymentMethodDto;
export type TUpdatePaymentMethodData = UpdatePaymentMethodDto;
export type TCreateStripeConnectData = CreateStripeConnectDto;
