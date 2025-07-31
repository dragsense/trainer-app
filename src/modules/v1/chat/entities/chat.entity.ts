/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "../messages/entities/message.entity";
import { ChatUsers } from "./chat-users.entity";

export enum ChatType {
  SINGLE = 'single',
  GROUP = 'group'
}

@Entity()
export class Chat {

    @ApiProperty({ example: 1, description: 'The unique identifier of the chat' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'General', description: 'The name of the chat' })
    @Column({ type: 'varchar', nullable: true })
    name: string;

    @ApiProperty({ example: 'group', description: 'Type of chat - single or group', enum: ChatType })
    @Column({ type: 'enum', enum: ChatType, default: ChatType.SINGLE })
    type: ChatType;

    @OneToMany(() => Message, (message) => message.chat, { onDelete: 'CASCADE' })
    messages?: Message[];

    @OneToMany(() => ChatUsers, (chatUsers) => chatUsers.chat, { onDelete: 'CASCADE' })
    chatUsers?: ChatUsers[];

    @ApiProperty({ example: '2024-02-12T14:30:00.000Z', description: 'Timestamp when the department was created' })
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ApiProperty({ example: '2024-02-13T10:45:00.000Z', description: 'Timestamp when the department was last updated' })
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
