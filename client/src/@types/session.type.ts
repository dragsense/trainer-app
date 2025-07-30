import { Session } from "#/modules/v1/sessions/entities/session.entity";
import { SessionBooking } from "#/modules/v1/sessions/entities/session-booking.entity";
import { Invoice } from "#/modules/v1/sessions/entities/invoice.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateSessionDto } from "#/modules/v1/sessions/dto/create-session.dto";

export interface ISession extends Session, GeneralBaseEntity {}

export interface ISessionBooking extends SessionBooking, GeneralBaseEntity {}

export interface IInvoice extends Invoice, GeneralBaseEntity {}

export type TSessionData = CreateSessionDto;