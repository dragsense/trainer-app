/* eslint-disable prettier/prettier */
import { User } from "@/modules/v1/users/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";
import { Chat } from "./chat.entity";

@Entity('chat_users')
export class ChatUsers {

    @ApiProperty({ example: 1, description: 'The unique identifier of the ChatUser' })
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Chat, (chat) => chat.chatUsers, { onDelete: 'CASCADE' })
    chat: Chat;

    @ManyToOne(() => User, (user) => user.chatUsers, { onDelete: 'CASCADE' })
    user: User;

    @ApiProperty({ example: 5, description: 'Number of unread messages for this user in this chat' })
    @Column({ type: 'int', default: 0 })
    unreadCount: number;

    @ApiProperty({ example: '2024-02-12T14:30:00.000Z', description: 'Timestamp when the user last read messages in this chat' })
    @Column({ type: 'timestamp', nullable: true })
    lastReadAt: Date;

    @ApiProperty({ example: '2024-02-12T14:30:00.000Z', description: 'Timestamp when the chat user was created' })
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ApiProperty({ example: '2024-02-13T10:45:00.000Z', description: 'Timestamp when the chat user was last updated' })
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
