import { Reminder } from "#/modules/v1/reminders/entities/reminder.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";
import { CreateReminderDto } from "#/modules/v1/reminders/dto/create-reminder.dto";

import { IUser } from "./user.type";
import { IBilling } from "./billing.type";
import { ISession } from "./session.type";

export interface IReminder extends Omit<Reminder, 'recipient' | 'creator' | 'session' | 'billing'>, GeneralBaseEntity {
    recipient: IUser
    creator: IUser
    session: ISession
    billing: IBilling
 }

export type TReminderData = Omit<CreateReminderDto, | 'creatorId'>;
