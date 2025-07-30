import { Session } from "#/modules/v1/sessions/entities/session.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateSessionDto } from "#/modules/v1/sessions/dto/create-session.dto";

export interface ISession extends Session, GeneralBaseEntity {}


export type TSessionData = CreateSessionDto;