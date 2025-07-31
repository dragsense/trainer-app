/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@/shared-dto/list-query.dto';
import { Message } from './entities/message.entity';
import { DeleteMessagesDto } from './dto/delete-message.dto';

@ApiTags('Messages')
@ApiParam({ name: 'chatId', type: Number, required: true })
@Controller('chat/:chatId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @ApiOperation({ summary: 'Submit a message via REST API and broadcast via WebSocket' })
  @ApiResponse({ status: 201, description: 'Message submitted and broadcasted' })
  @Post()
  async submitMessage(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() createMessageDto: CreateMessageDto
  ) {
    return this.messagesService.create(chatId, createMessageDto);
  }

  @ApiOperation({ summary: 'Get messages for a chat (paginated)' })
  @ApiResponse({ status: 200, description: 'List of messages', type: Message, isArray: true })
  @Get()
  findAll(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query() paginationDto: PaginationDto
  ) {
    return this.messagesService.getMessages(chatId, paginationDto);
  }

  @ApiOperation({ summary: 'Delete messages by IDs for a chat and sender' })
  @ApiResponse({ status: 200, description: 'Messages deleted' })
  @Post('delete')
  removeMessages(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Body() deleteMessagesDto: DeleteMessagesDto
  ) {
    return this.messagesService.removeMessages(chatId, deleteMessagesDto);
  }

  @ApiOperation({ summary: 'Clear all messages in a chat' })
  @ApiResponse({ status: 200, description: 'Chat cleared' })
  @Delete('clear')
  clearChat(
    @Param('chatId', ParseIntPipe) chatId: number
  ) {
    return this.messagesService.removeAllMessages(chatId);
  }
}