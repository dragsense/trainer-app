/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards, Patch, HttpCode } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Chat } from './entities/chat.entity';
import { ChatListDto } from './dto/chat-list.dto';
import { JwtAuthGuard } from '../auth/gaurds/jwt-auth.gaurd';

@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @ApiOperation({ summary: 'Get all chats' })
  @ApiResponse({ status: 200, description: 'Returns all chats.', type: Chat, isArray: true })
  @Get()
  findAll(@Req() req: any, @Query() queryDto: ChatListDto) {

    return this.chatService.findAll(queryDto, req.user);
  }


  @ApiOperation({ summary: 'Get a chat by ID' })
  @ApiResponse({ status: 200, description: 'Returns a single chat.', type: Chat })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a chat by ID' })
  @ApiBody({ type: UpdateChatDto })
  @ApiResponse({ status: 200, description: 'Chat updated successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @ApiOperation({ summary: 'Delete a chat by ID' })
  @ApiResponse({ status: 204, description: 'Chat deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.remove(id);
  }

  @ApiOperation({ summary: 'Create a new chat.' })
  @ApiBody({ type: CreateChatDto })
  @ApiResponse({
    status: 200,
    description: 'Chat created successfully and not found users.',
    type: CreateChatDto,
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @Post()
  async create(@Req() req: any, @Body() createChatDto: CreateChatDto) {
    return this.chatService.create(req.user, createChatDto);
  }

  @ApiOperation({ summary: 'Get users who participated in chats' })
  @ApiResponse({
    status: 200,
    description: 'List of users who are participants in at least one chat',
    type: User,
    isArray: true,
  })
  @Get('users')
  getAllChatUsers() {
    return this.chatService.findAllUsersInChats();
  }

  @ApiOperation({ summary: 'Mark chat as read for current user' })
  @ApiResponse({
    status: 200,
    description: 'Chat marked as read successfully',
  })
  @Post(':id/read')
  markChatAsRead(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.chatService.markChatAsRead(id, req.user.id);
  }

}
