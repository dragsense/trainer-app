import { Session } from "#/modules/v1/sessions/entities/session.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateSessionDto } from "#/modules/v1/sessions/dto/create-session.dto";
import { IUser } from "./user.type";

export interface ISession extends Omit<Session, 'clients'>, GeneralBaseEntity {
    clientCount: number;
    trainer: IUser;
    clients: IUser[];
}

export type TSessionData = CreateSessionDto;