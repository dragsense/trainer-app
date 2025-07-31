import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ParseIntPipe, Logger } from '@nestjs/common';
import { MessagesService } from '@/modules/chat/messages/messages.service';
import { MessageSubscriber } from '@/modules/chat/messages/message.subscriber';
import { CreateMessageDto } from '@/modules/chat/messages/dto/create-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    constructor(private readonly messagesService: MessagesService) { }

    afterInit(server: Server) {
        this.logger.log('🚀 Chat Gateway initialized');
        // Set up the subscriber to broadcast messages
        MessageSubscriber.setChatGateway(this);
    }

    handleConnection(client: Socket) {
        this.logger.log(`🔌 Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`🔌 Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinChat')
    handleJoinChat(
        @MessageBody('chatId', ParseIntPipe) chatId: number,
        @ConnectedSocket() client: Socket
    ) {
        this.logger.log(`👥 Client ${client.id} joining chat ${chatId}`);
        const chatRoom = chatId.toString();
        client.join(chatRoom);
        client.emit('joinChat', { chatId });

        // ✅ Send acknowledgment
        return { success: true, message: `Joined chat ${chatId}` };
    }

    @SubscribeMessage('leaveChat')
    handleLeaveChat(
        @MessageBody('chatId', ParseIntPipe) chatId: number,
        @ConnectedSocket() client: Socket 
    ) {
        this.logger.log(`👋 Client ${client.id} leaving chat ${chatId}`);
        const chatRoom = chatId.toString();
        client.leave(chatRoom);
        client.emit('leaveChat', { chatId });

        return { success: true, message: `Left chat ${chatId}` };
    }

    @SubscribeMessage('message')
    async handleSendMessage(
        @MessageBody('chatId', ParseIntPipe) chatId: number,
        @MessageBody('senderId', ParseIntPipe) senderId: number,
        @MessageBody('content') content: string,
        @ConnectedSocket() client: Socket
    ) {
        this.logger.log(`💬 Client ${client.id} sending message to chat ${chatId}`);
        try {
            const createMessageDto: CreateMessageDto = { senderId, content };
            const newMessage = await this.messagesService.create(chatId, createMessageDto);

            return { success: true, message: 'Message sent successfully', data: newMessage };
        } catch (error) {
            this.logger.error(`❌ Error sending message: ${error.message}`);
            return { success: false, error: { message: error.message } };
        }
    }

    // Method to broadcast new chat creation to all users
    broadcastNewChat(chatData: any) {
        this.logger.log(`📢 Broadcasting new chat: ${chatData.chatId}`);
        this.server.emit('newChat', chatData);
    }

    // Method to broadcast chat updates to specific users
    broadcastChatUpdate(chatId: number, updateData: any) {
        this.logger.log(`📢 Broadcasting chat update: ${chatId}`);
        this.server.to(chatId.toString()).emit('chatUpdated', updateData);
    }

    // Method to broadcast when a chat is marked as read
    broadcastChatRead(chatId: number, userId: number) {
        this.logger.log(`📢 Broadcasting chat read: ${chatId} by user: ${userId}`);
        this.server.emit('chatRead', { chatId, userId });
    }
}