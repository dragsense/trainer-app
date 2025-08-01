import { AppSetting } from "#/modules/v1/settings/app-setting/entities/app-setting.entity";
import { NotificationSetting } from "#/modules/v1/settings/notification-settings/entities/notification-setting.entity";
import { PaymentMethod } from "#/modules/v1/settings/payment-methods/entities/payment-method.entity";
import { Profile } from "#/modules/v1/users/profiles/entities/profile.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateAppSettingDto } from "#/modules/v1/settings/app-setting/dto/create-app-setting.dto";
import { UpdateAppSettingDto } from "#/modules/v1/settings/app-setting/dto/update-app-setting.dto";
import { CreatePaymentMethodDto } from "#/modules/v1/settings/payment-methods/dto/create-payment-method.dto";
import { UpdatePaymentMethodDto } from "#/modules/v1/settings/payment-methods/dto/update-payment-method.dto";
import { CreateProfileDto } from "#/modules/v1/users/profiles/dto/create-profile.dto";

// Extend backend entities with frontend-specific properties
export interface IAppSetting extends AppSetting, GeneralBaseEntity {}

export interface INotificationSetting extends NotificationSetting, GeneralBaseEntity {}

export interface IProfile extends Profile, GeneralBaseEntity {}

export interface IPaymentMethod extends PaymentMethod, GeneralBaseEntity {}

// Combined Settings Interface
export interface ISettings {
  profile: IProfile;
  notifications: INotificationSetting;
  paymentMethods: IPaymentMethod[];
  appSetting: IAppSetting;
}

// Data types for API calls
export type TProfileData = CreateProfileDto;
export type TAppSettingData = CreateAppSettingDto;
export type TUpdateAppSettingData = UpdateAppSettingDto;
export type TPaymentMethodData = CreatePaymentMethodDto;
export type TUpdatePaymentMethodData = UpdatePaymentMethodDto;
