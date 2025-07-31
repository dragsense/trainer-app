/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { In, Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { User } from '@/modules/v1/users/entities/user.entity';
import { PaginationDto } from '@/shared-dto/list-query.dto';
import { MessageListDto } from './dto/message-List.dto';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageSubscriber } from './message.subscriber';
import { DeleteMessagesDto } from './dto/delete-message.dto';


@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepo: Repository<Chat>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) { }

  async create(chatId: number, createMessageDto: CreateMessageDto): Promise<{message: string}> {
    const chat = await this.chatRepo.findOneBy({ id: chatId });
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    const sender = await this.userRepo.findOne({ 
      where: { id: createMessageDto.senderId },
      relations: ['profile']
    });
    if (!sender) {
      throw new HttpException('Sender not found', HttpStatus.NOT_FOUND);
    }

    const message = this.messageRepo.create({
      chat,
      sender,
      content: createMessageDto.content
    });

    await this.messageRepo.save(message);

    return {message: 'Message sent successfully'};
  }


  async getMessages(
    chatId: number,
    paginationDto: PaginationDto
  ): Promise<PaginationResponse<MessageListDto>> {
    const { limit = 50, page = 1 } = paginationDto;

    const [messages, total] = await this.messageRepo.findAndCount({
      where: { chat: { id: chatId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const mapped: MessageListDto[] = messages
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Ascending
      .map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        updatedAt: msg.updatedAt.toISOString(),
        sender: {
          id: msg.sender.id,
          email: msg.sender.email,
          level: msg.sender.level,
        },
      }));

    const lastPage = Math.ceil(total / limit);

    return {
      data: mapped,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async removeMessages(chatId: number, deleteMessagesDto: DeleteMessagesDto): Promise<{ message: string }> {
    const chat = await this.chatRepo.findOneBy({ id: chatId });
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    const result = await this.messageRepo.delete({
      id: In(deleteMessagesDto.messageIds),
      chat: { id: chatId }
    });

    if (result.affected === 0) {
      throw new HttpException('Messages not found', HttpStatus.NOT_FOUND);
    }

    if (MessageSubscriber['chatGateway']?.server) {
      MessageSubscriber['chatGateway'].server.to(chatId.toString()).emit('messagesRemoved', {
        messageIds: deleteMessagesDto.messageIds,
        chatId,
      });
    }

    return { message: 'Messages deleted successfully' };
  }


  async removeAllMessages(chatId: number): Promise<{ message: string }> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    const deleteResult = await this.messageRepo.delete({ chat: { id: chatId } });

    if (deleteResult.affected === 0) {
      throw new HttpException('No messages found for this chat', HttpStatus.NOT_FOUND);
    }

    if (MessageSubscriber['chatGateway']?.server) {
      MessageSubscriber['chatGateway'].server.to(chatId.toString()).emit('chatCleared', {
        chatId,
      });
    }

    return { message: 'Chat cleared successfully' };
  }

}

