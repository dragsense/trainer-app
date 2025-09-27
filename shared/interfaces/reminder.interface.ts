import { Reminder } from '../entities/reminders/reminder.entity';
import { GeneralBaseEntity } from '../entities/common/base.entity';

export interface IReminder extends Reminder, GeneralBaseEntity {}

