import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'notification_settings' })
export class NotificationSetting {
    @ApiProperty({ example: 1, description: 'Unique identifier for the notification setting' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: true, description: 'Enable email notifications', default: true })
    @Column({ type: 'boolean', default: true })
    emailNotifications: boolean;

    @ApiProperty({ example: true, description: 'Enable new user notifications', default: true })
    @Column({ type: 'boolean', default: true })
    newUserNotifications: boolean;

    @ApiProperty({ example: true, description: 'Enable user updates notifications', default: true })
    @Column({ type: 'boolean', default: true })
    userUpdateNotifications: boolean;

    @ApiProperty({ example: true, description: 'Enable billing notifications', default: true })
    @Column({ type: 'boolean', default: true })
    billingNotifications: boolean;

    @ApiProperty({ example: true, description: 'Enable session notifications', default: true })
    @Column({ type: 'boolean', default: true })
    sessionNotifications: boolean;

    @ApiProperty({ type: () => User, description: 'The user this notification setting belongs to' })
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({
        example: '2024-02-12T14:30:00.000Z',
        description: 'Timestamp when the setting was created',
    })
    @CreateDateColumn({ type: 'timestamp with time zone' })
    createdAt: Date;

    @ApiProperty({
        example: '2024-02-13T10:45:00.000Z',
        description: 'Timestamp when the setting was last updated',
    })
    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updatedAt: Date;
}
