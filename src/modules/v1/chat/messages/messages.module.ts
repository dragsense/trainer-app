/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Chat } from '../entities/chat.entity';
import { User } from '@/modules/v1/users/entities/user.entity';
import { MessageSubscriber } from './message.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Chat, User])],
  controllers: [MessagesController],
  providers: [MessagesService, MessageSubscriber],
  exports: [MessagesService],
})
export class MessagesModule {}
