import { AppSetting, NotificationSetting, PaymentMethod } from "../entities";
import { GeneralBaseEntity } from "../entities/common/base.entity";
import {
    StripeConnectStatusDto,
    StripeConnectCreateResponseDto,
} from "../dtos/settings-dtos";
import { IMessageResponse } from "shared/interfaces";

// Extend backend entities with frontend-specific properties
export interface IAppSetting extends AppSetting, GeneralBaseEntity { }

export interface INotificationSetting extends NotificationSetting, GeneralBaseEntity { }

export interface IPaymentMethod extends PaymentMethod, GeneralBaseEntity { }

export interface IStripeConnectStatus extends StripeConnectStatusDto { }

export interface IStripeConnectCreateResponse extends StripeConnectCreateResponseDto { }

export interface IStripeConnectDeleteResponse extends IMessageResponse { }

