/* eslint-disable prettier/prettier */

import { User } from "@/modules/v1/users/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Chat } from "../../entities/chat.entity";


@Entity('messages')
export class Message {
  @ApiProperty({ example: 1, description: 'The unique identifier of the message' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Chat;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  sender: User;

  @ApiProperty({ example: 'Hey, I have a good news.', description: 'Message content' })
  @Column()
  content: string;

  @ApiProperty({ example: '2024-02-12T14:30:00.000Z', description: 'Timestamp when the department was created' })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({ example: '2024-02-13T10:45:00.000Z', description: 'Timestamp when the department was last updated' })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
