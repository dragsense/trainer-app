import { Notification } from '../entities/notifications/notification.entity';
import { GeneralBaseEntity } from '../entities/common/base.entity';

export interface INotification extends Notification, GeneralBaseEntity {}

