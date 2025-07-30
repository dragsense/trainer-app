import { Reminder } from "#/modules/v1/reminders/entities/reminder.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";
import { CreateReminderDto } from "#/modules/v1/reminders/dto/create-reminder.dto";

export interface IReminder extends Reminder, GeneralBaseEntity {}

export type TReminderData = Omit<CreateReminderDto, 'recipientId' | 'creatorId' | 'sessionId' | 'paymentId'>;
