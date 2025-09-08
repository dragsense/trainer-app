import { Notification } from "#/modules/v1/notifications/entities/notification.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";
import { CreateNotificationDto } from "#/modules/v1/notifications/dto/create-notification.dto";
export interface INotification extends Notification, GeneralBaseEntity { }

export type TNotficationData = Omit<CreateNotificationDto, 'id' | 'createdAt' | 'updatedAt'>;