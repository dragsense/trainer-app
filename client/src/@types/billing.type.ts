import { Billing } from "#/modules/v1/billings/entities/billing.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateBillingDto } from "#/modules/v1/billings/dto/create-billing.dto";

export interface IBilling extends Billing, GeneralBaseEntity {}


export type TBillingData = CreateBillingDto;