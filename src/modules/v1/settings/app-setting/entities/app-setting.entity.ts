import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '@/modules/v1/users/entities/user.entity';

@Entity({ name: 'app_setting' })
export class AppSetting {
    @ApiProperty({ example: 1, description: 'Unique identifier for the app setting' })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: true, description: 'Allow Notification', default: true })
    @Column({ type: 'boolean', default: true })
    allowNotification: boolean;

    @ApiProperty({ type: () => User, description: 'The user this app setting belongs to' })
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
