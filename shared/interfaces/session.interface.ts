import { Session } from '../entities/sessions/session.entity';
import { GeneralBaseEntity } from '../entities/common/base.entity';

export interface ISession extends Session, GeneralBaseEntity {
    clientCount: number;
}

