import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';
import { Message } from './entities/message.entity';
import { Injectable } from '@nestjs/common';
import { ChatUsers } from '../entities/chat-users.entity';

@Injectable()
@EventSubscriber()
export class MessageSubscriber implements EntitySubscriberInterface<Message> {
  private static chatGateway: any;

  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  static setChatGateway(gateway: any) {
    MessageSubscriber.chatGateway = gateway;
  }

  listenTo() {
    return Message;
  }

  async afterInsert(event: InsertEvent<Message>) {
    const message = event.entity;
    
    // Load the message with all relations
    const messageWithRelations = await event.manager.findOne(Message, {
      where: { id: message.id },
      relations: ['sender', 'chat', 'sender.profile'],
    });
    
    if (messageWithRelations && MessageSubscriber.chatGateway?.server) {
      // Increment unread count for all users in the chat except the sender
      const chatUsers = await event.manager.find(ChatUsers, {
        where: { chat: { id: messageWithRelations.chat.id } },
        relations: ['user', 'user.profile'],
      });

      // Update unread counts
      for (const chatUser of chatUsers) {
        if (chatUser.user.id !== messageWithRelations.sender.id) {
          chatUser.unreadCount = (chatUser.unreadCount || 0) + 1;
          await event.manager.save(ChatUsers, chatUser);
        }
      }

      // Update chat's updatedAt timestamp
      await event.manager.update('chat', messageWithRelations.chat.id, {
        updatedAt: new Date()
      });

      // Broadcast message to chat room
      MessageSubscriber.chatGateway.server.to(messageWithRelations.chat.id.toString()).emit('message', {
        id: messageWithRelations.id,
        chatId: messageWithRelations.chat.id,
        sender: {
          id: messageWithRelations.sender.id,
          email: messageWithRelations.sender.email,
          firstName: messageWithRelations.sender.profile?.firstName || '',
          lastName: messageWithRelations.sender.profile?.lastName || '',
        },
        content: messageWithRelations.content,
        createdAt: messageWithRelations.createdAt,
      });

      // Broadcast chat update to all participants
      MessageSubscriber.chatGateway.server.emit('chatUpdated', {
        chatId: messageWithRelations.chat.id,
        lastMessage: {
          id: messageWithRelations.id,
          content: messageWithRelations.content,
          createdAt: messageWithRelations.createdAt,
          sender: {
            id: messageWithRelations.sender.id,
            email: messageWithRelations.sender.email,
            firstName: messageWithRelations.sender.profile?.firstName || '',
            lastName: messageWithRelations.sender.profile?.lastName || '',
          }
        },
        unreadCounts: chatUsers.map(cu => ({
          userId: cu.user.id,
          unreadCount: cu.unreadCount
        }))
      });
    }
  }

  async afterRemove(event: RemoveEvent<Message>) {
    const message = event.entity;
    
    if (message && MessageSubscriber.chatGateway?.server) {
      // Broadcast message removal
      MessageSubscriber.chatGateway.server.to(message.chat.id.toString()).emit('messagesRemoved', {
        messageId: message.id,
        chatId: message.chat.id,
      });
    }
  }
} 