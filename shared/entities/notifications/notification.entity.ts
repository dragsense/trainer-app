import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ENotificationStatus, ENotificationType } from '../../enums';

@Entity({ name: 'notifications' })
export class Notification {
    @ApiProperty({ example: 1, description: 'Unique identifier for the notification' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: 'New member registered', description: 'Title of the notification' })
    @Column({ type: 'varchar', length: 255 })
    title: string;

    @ApiProperty({ example: 'John Doe has registered as a new member', description: 'Message content of the notification' })
    @Column({ type: 'text' })
    message: string;

    @ApiProperty({ 
        example: ENotificationType.NEW_USER, 
        description: 'Type of notification',
        enum: ENotificationType 
    })
    @Column({ 
        type: 'enum', 
        enum: ENotificationType, 
        default: ENotificationType.GENERAL 
    })
    type: ENotificationType;

    @ApiProperty({ 
        example: ENotificationStatus.UNREAD, 
        description: 'Status of the notification',
        enum: ENotificationStatus 
    })
    @Column({ 
        type: 'enum', 
        enum: ENotificationStatus, 
        default: ENotificationStatus.UNREAD 
    })
    status: ENotificationStatus;

    @ApiProperty({ example: '/members/123', description: 'Link to related content', required: false })
    @Column({ type: 'varchar', length: 500, nullable: true })
    link: string;

    @ApiProperty({ example: 'user_avatar.jpg', description: 'Icon for the notification', required: false })
    @Column({ type: 'varchar', length: 255, nullable: true })
    icon: string;

    @ApiProperty({ example: { memberId: 123, membershipType: 'premium' }, description: 'Additional data for the notification', required: false })
    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @ApiProperty({ type: () => User, description: 'The user who should receive this notification' })
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({ example: 1, description: 'ID of the user who should receive this notification' })
    @Column({ type: 'int' })
    userId: number;

    @ApiProperty({
        example: '2024-02-12T14:30:00.000Z',
        description: 'Timestamp when the notification was created',
    })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @ApiProperty({
        example: '2024-02-13T10:45:00.000Z',
        description: 'Timestamp when the notification was last updated',
    })
    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
