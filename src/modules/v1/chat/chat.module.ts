/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { ChatUsers } from './entities/chat-users.entity';
import { UsersModule } from '../users/users.module';
import { Message } from './messages/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { ChatGateway } from '@/gateways/chat.gateway';


@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatUsers, Message, User]),
    MessagesModule,
    UsersModule
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],

})
export class ChatModule { }
