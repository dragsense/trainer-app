import { Reminder } from "#/modules/v1/reminders/entities/reminder.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";
import { CreateReminderDto } from "#/modules/v1/reminders/dto/create-reminder.dto";
import { Session } from "#/modules/v1/sessions/entities/session.entity";

import { IUser } from "./user.type";

export interface IReminder extends Reminder, GeneralBaseEntity {
    recipient: IUser
    creator: IUser
    session: Session & GeneralBaseEntity
 }

export type TReminderData = Omit<CreateReminderDto, | 'creatorId'>;
