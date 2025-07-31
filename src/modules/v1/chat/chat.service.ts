/* eslint-disable prettier/prettier */
import { Get, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateChatDto } from './dto/update-chat.dto';
import { In, Not, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './messages/entities/message.entity';
import { ChatUsers } from './entities/chat-users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatListDto } from './dto/chat-list.dto';
import { PaginationResponse } from '@/interfaces/pagination-response.interface';
import { ChatType } from './entities/chat.entity';
import { ChatGateway } from '@/gateways/chat.gateway';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly chatGateway: ChatGateway,
  ) { }

  //create chat
  async create(user: User, createChatDto: CreateChatDto): Promise<{ message: string; notFoundUsers: number[] }> {
    const { name, userIds } = createChatDto;

    // Ensure the current user is included in the chat
    if (!userIds.includes(user.id)) {
      userIds.push(user.id);
    }

    // Remove duplicates from userIds
    const uniqueUserIds = [...new Set(userIds)];

    // Determine chat type
    const chatType = uniqueUserIds.length === 2 ? ChatType.SINGLE : ChatType.GROUP;

    // For group chats, name is required
    if (chatType === ChatType.GROUP && !name) {
      throw new HttpException('Group chats must have a name', HttpStatus.BAD_REQUEST);
    }

    // Check if users exist
    const users = await this.userRepo.findBy({ id: In(uniqueUserIds) });
    const foundUserIds = users.map(u => u.id);
    const notFoundUsers = uniqueUserIds.filter(id => !foundUserIds.includes(id));

    if (notFoundUsers.length > 0) {
      return {
        message: `Some users not found: ${notFoundUsers.join(', ')}`,
        notFoundUsers,
      };
    }

    // Check if single chat already exists between 2 users
    if (chatType === ChatType.SINGLE) {
      const existingChat = await this.chatRepo.createQueryBuilder('chat')
        .innerJoin('chat.chatUsers', 'cu1', 'cu1.user.id = :userId1', { userId1: uniqueUserIds[0] })
        .innerJoin('chat.chatUsers', 'cu2', 'cu2.user.id = :userId2', { userId2: uniqueUserIds[1] })
        .innerJoin('chat.chatUsers', 'cuCount')
        .where('chat.type = :chatType', { chatType: ChatType.SINGLE })
        .groupBy('chat.id')
        .having('COUNT(cuCount.id) = 2')
        .getOne();

      if (existingChat) {
        throw new HttpException('Single chat already exists between these users', HttpStatus.BAD_REQUEST);
      }
    }

    // Create new chat
    const chat = this.chatRepo.create({
      name: chatType === ChatType.SINGLE ? undefined : name,
      type: chatType
    });
    await this.chatRepo.save(chat);

    // Create chat users relationships
    const chatUsers = users.map(u =>
      this.chatUsersRepo.create({ user: u, chat }),
    );
    await this.chatUsersRepo.save(chatUsers);

    // Broadcast new chat to all participants
    try {
      if (this.chatGateway) {
        const participants = users.map(u => ({
          userId: u.id,
          email: u.email,
          firstName: u.profile?.firstName || '',
          lastName: u.profile?.lastName || ''
        }));
        
        this.chatGateway.broadcastNewChat({
          chatId: chat.id,
          chat: {
            id: chat.id,
            name: chat.name,
            type: chat.type,
            createdAt: chat.createdAt
          },
          participants
        });
      }
    } catch (error) {
      console.error('Failed to broadcast new chat:', error);
    }

    return {
      message: 'Chat created successfully',
      notFoundUsers: [],
    };
  }

  async findAll(queryDto: ChatListDto, user: User): Promise<PaginationResponse<Chat>> {
    const {
      page = 1,
      limit = 10,
      search,
      userLevel,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ...filters
    } = queryDto;

    const query = this.chatRepo.createQueryBuilder('chat')
      .leftJoinAndSelect('chat.chatUsers', 'chatUsers')               // join all chatUsers
      .leftJoinAndSelect('chatUsers.user', 'users')                   // join all users (not filtered here!)
      .leftJoinAndSelect('users.profile', 'profile')                  // join their profiles
      .leftJoinAndSelect('chat.messages', 'messages')                 // join messages for last message info
      .leftJoinAndSelect('messages.sender', 'messageSender')          // join message sender
      .leftJoinAndSelect('messageSender.profile', 'senderProfile')    // join sender profile
      .where((qb) => {
        // Subquery to filter chats where current user is a participant
        const subQuery = qb.subQuery()
          .select('cu.chatId')
          .from('chat_users', 'cu')
          .where('cu.userId = :userId')
          .getQuery();

        return 'chat.id IN ' + subQuery;
      })
      .setParameter('userId', user.id)
      .orderBy('chat.updatedAt', 'DESC');

    // Apply search filter using subquery to search across ALL users in each chat
    if (search) {
      query.andWhere(`
        (chat.name ILIKE :search OR 
         EXISTS (
           SELECT 1 FROM chat_users cu 
           INNER JOIN users u ON cu."userId" = u.id 
           INNER JOIN profiles up ON u."profileId" = up.id
           WHERE cu."chatId" = chat.id 
           AND (up."firstName" ILIKE :search OR up."lastName" ILIKE :search)
         ))
      `, { search: `%${search}%` });
    }

    if (userLevel !== undefined) {
      console.log('Filtering by userLevel:', userLevel, 'Type:', typeof userLevel, 'Current User ID:', user?.id);
      if (userLevel === -1) {
        // -1 means all chats, no additional filter needed
      } else if (userLevel === -2) {
        // -2 means group chats only
        query.andWhere('chat.type = :chatType', { chatType: ChatType.GROUP });
      } else {
        // Fallback: show chats that contain any user with specific level
        query.andWhere('chat.type = :singleChatType', { singleChatType: ChatType.SINGLE })
          .andWhere(`
              EXISTS (
                SELECT 1 FROM chat_users cu 
                INNER JOIN users u ON cu."userId" = u.id 
                WHERE cu."chatId" = chat.id AND u.level = :userLevel
              )
            `, { userLevel });
      }
    }

    // Apply date filters if provided
    if (createdAfter) {
      query.andWhere('chat.createdAt >= :createdAfter', { createdAfter });
    }
    if (createdBefore) {
      query.andWhere('chat.createdAt <= :createdBefore', { createdBefore });
    }
    if (updatedAfter) {
      query.andWhere('chat.updatedAt >= :updatedAfter', { updatedAfter });
    }
    if (updatedBefore) {
      query.andWhere('chat.updatedAt <= :updatedBefore', { updatedBefore });
    }

    // Get paginated results
    const [chats, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Enhance chats with unread counts and last message info
    const enhancedChats = await Promise.all(chats.map(async (chat) => {
      // Get unread count for current user
      const currentUserChat = chat.chatUsers?.find(cu => cu.user.id === user.id);
      const unreadCount = currentUserChat?.unreadCount || 0;

      // Get last message info
      const lastMessage = chat.messages && chat.messages.length > 0 
        ? chat.messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : null;

      return {
        ...chat,
        unreadCount,
        lastMessage: lastMessage && lastMessage.sender ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          sender: {
            id: lastMessage.sender.id,
            email: lastMessage.sender.email,
            firstName: lastMessage.sender.profile?.firstName || '',
            lastName: lastMessage.sender.profile?.lastName || '',
          }
        } : null
      };
    }));

    const lastPage = Math.ceil(total / limit);

    return {
      data: enhancedChats,
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: number): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id },
      relations: [
        'messages',
        'chatUsers',
        'chatUsers.user',
        'chatUsers.user.profile'
      ]
    });

    if (!chat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    return chat;
  }

  async update(id: number, updateChatDto: UpdateChatDto) {
    const { name, userIds } = updateChatDto;

    const existingChat = await this.chatRepo.findOne({
      where: { id },
      relations: ['chatUsers', 'chatUsers.user']
    });

    if (!existingChat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    // Only allow name updates for group chats
    if (name !== undefined) {
      if (existingChat.type === ChatType.SINGLE) {
        throw new HttpException('Cannot update name of single chats', HttpStatus.BAD_REQUEST);
      }
      existingChat.name = name;
      await this.chatRepo.save(existingChat);
    }

    // Only allow user updates for group chats
    if (userIds && userIds.length > 0) {
      if (existingChat.type === ChatType.SINGLE) {
        throw new HttpException('Cannot modify users in single chats', HttpStatus.BAD_REQUEST);
      }

      // Remove duplicates and validate users exist
      const uniqueUserIds = [...new Set(userIds)];
      const users = await this.userRepo.findBy({ id: In(uniqueUserIds) });
      const foundUserIds = users.map(u => u.id);
      const notFoundUsers = uniqueUserIds.filter(id => !foundUserIds.includes(id));

      if (notFoundUsers.length > 0) {
        throw new HttpException(
          `Users not found: ${notFoundUsers.join(', ')}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Remove existing chat users and add new ones
      await this.chatUsersRepo.delete({ chat: { id } });

      const newChatUsers = users.map(user =>
        this.chatUsersRepo.create({ user, chat: existingChat }),
      );
      await this.chatUsersRepo.save(newChatUsers);
    }

    return { message: 'Chat updated successfully' };
  }

  async remove(id: number): Promise<{ message: string }> {
    const existingChat = await this.chatRepo.findOne({
      where: { id },
      relations: ['chatUsers', 'messages']
    });

    if (!existingChat) {
      throw new HttpException('Chat not found', HttpStatus.NOT_FOUND);
    }

    // Delete chat (cascade will handle chatUsers and messages)
    await this.chatRepo.remove(existingChat);

    return { message: 'Chat deleted successfully' };
  }

  async findAllUsersInChats(): Promise<User[]> {
    // Use a more efficient query to get unique users
    const users = await this.userRepo.createQueryBuilder('user')
      .innerJoin('user.chatUsers', 'chatUsers')
      .leftJoinAndSelect('user.profile', 'profile')
      .distinct(true)
      .orderBy('user.id', 'ASC')
      .getMany();

    return users;
  }

  // Debug method to check user levels in chats
  async debugUserLevelsInChats(): Promise<any> {
    const result = await this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.level', 'profile.firstName', 'profile.lastName', 'chat.id as chatId', 'chat.type'])
      .innerJoin('user.chatUsers', 'chatUsers')
      .innerJoin('chatUsers.chat', 'chat')
      .leftJoin('user.profile', 'profile')
      .where('chat.type = :chatType', { chatType: ChatType.SINGLE })
      .getRawMany();

    console.log('User levels in single chats:', result);
    return result;
  }

  async markChatAsRead(chatId: number, userId: number): Promise<void> {
    const chatUser = await this.chatUsersRepo.findOne({
      where: { chat: { id: chatId }, user: { id: userId } }
    });

    if (chatUser) {
      chatUser.unreadCount = 0;
      chatUser.lastReadAt = new Date();
      await this.chatUsersRepo.save(chatUser);

      // Broadcast chat read status to other users
      try {
        this.chatGateway.broadcastChatRead(chatId, userId);
      } catch (error) {
        console.error('Failed to broadcast chat read:', error);
      }
    }
  }

}
