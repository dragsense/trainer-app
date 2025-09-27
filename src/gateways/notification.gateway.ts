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
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway implements OnGatewayInit {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationGateway.name);
    private static instance: NotificationGateway;

    afterInit(server: Server) {
        this.logger.log('🚀 Notification Gateway initialized');
        NotificationGateway.instance = this;
    }

    handleConnection(client: Socket) {
        this.logger.log(`🔌 Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`🔌 Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinUserRoom')
    handleJoinUserRoom(
        @MessageBody('userId') userId: number,
        @ConnectedSocket() client: Socket
    ) {
        const userRoom = `user_${userId}`;
        client.join(userRoom);
        this.logger.log(`👤 User ${userId} joined room: ${userRoom}`);
        return { success: true, message: `Joined user room ${userId}` };
    }

    @SubscribeMessage('leaveUserRoom')
    handleLeaveUserRoom(
        @MessageBody('userId') userId: number,
        @ConnectedSocket() client: Socket
    ) {
        const userRoom = `user_${userId}`;
        client.leave(userRoom);
        this.logger.log(`👤 User ${userId} left room: ${userRoom}`);
        return { success: true, message: `Left user room ${userId}` };
    }

    // Static method to send notifications to specific users
    static sendNotificationToUser(userId: number, notification: any) {
        if (!userId) {
            return;
        }
        if (NotificationGateway.instance?.server) {
            NotificationGateway.instance.server.to(`user_${userId}`).emit('newNotification', notification);
            NotificationGateway.instance.logger.log(`📨 Sent notification to user ${userId}`);
        }
    }

    // Static method to send notifications to multiple usesrs
    static sendNotificationToUsers(userIds: number[], notification: any) {
        if (userIds.length === 0) {
            return;
        }
        if (NotificationGateway.instance?.server) {
            userIds.forEach(userId => {
                NotificationGateway.instance.server.to(`user_${userId}`).emit('newNotification', notification);
            });
            NotificationGateway.instance.logger.log(`📨 Sent notification to ${userIds.length} users`);
        }
    }

    // Static method to update unread count
    static updateUnreadCount(userId: number, count: number) {
        if (!userId) {
            return;
        }
        if (NotificationGateway.instance?.server) {
            NotificationGateway.instance.server.to(`user_${userId}`).emit('unreadCountUpdate', { count });
            NotificationGateway.instance.logger.log(`📊 Updated unread count for user ${userId}: ${count}`);
        }
    }
} 