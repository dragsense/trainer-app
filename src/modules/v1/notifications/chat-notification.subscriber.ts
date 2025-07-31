import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  Not,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';
import { Message } from '../chat/messages/entities/message.entity';
import { ChatUsers } from '../chat/entities/chat-users.entity';
import { NotificationType } from './enums/notification.enum';

@Injectable()
@EventSubscriber()
export class ChatNotificationSubscriber implements EntitySubscriberInterface<Message> {
  private static notificationsService: NotificationsService;

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  static setNotificationsService(service: NotificationsService) {
    ChatNotificationSubscriber.notificationsService = service;
  }

  listenTo() {
    return Message;
  }

  async afterInsert(event: InsertEvent<Message>) {
    if (!ChatNotificationSubscriber.notificationsService) return;

    try {
      await this.handleNewMessage(event.entity, event);
    } catch (error) {
      console.error('Error in chat notification subscriber:', error);
    }
  }

  private async handleNewMessage(message: Message, event: InsertEvent<Message>) {
    // Get all users in the chat except the sender
    const chatUsers = await event.manager.find(ChatUsers, {
      where: { 
        chat: { id: message.chat.id },
        user: { id: Not(message.sender.id) } // Exclude the sender
      },
      relations: ['user', 'chat'],
    });

    if (chatUsers.length > 0) {
      const userIds = chatUsers.map(cu => cu.user.id);
      
      // Get sender info for the notification
      const sender = await event.manager.findOne(User, {
        where: { id: message.sender.id },
        relations: ['profile']
      });

      const senderName = sender?.profile?.firstName || sender?.email || 'Someone';
      const chatName = message.chat.name || 'Chat';
      
      await ChatNotificationSubscriber.notificationsService.createNotificationForUsers(
        NotificationType.NEW_MESSAGE,
        `New message in ${chatName}`,
        `${senderName}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
        userIds,
        `/communication/chat/${message.chat.id}`,
        '💬',
        {
          chatId: message.chat.id,
          messageId: message.id,
          senderId: message.sender.id,
          senderName: senderName
        }
      );
    }
  }
} 