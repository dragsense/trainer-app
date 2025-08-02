import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export enum AssignmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

@Entity('client_trainer_assignments')
@Index(['clientId', 'trainerId'], { unique: true })
export class ClientTrainerAssignment {
  @ApiProperty({ description: 'Assignment ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Client ID' })
  @Column({ type: 'int' })
  clientId: number;

  @ApiProperty({ description: 'Trainer ID' })
  @Column({ type: 'int' })
  trainerId: number;

  @ApiProperty({
    enum: AssignmentStatus,
    description: 'Assignment status',
    default: AssignmentStatus.ACTIVE,
  })
  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

  @ApiPropertyOptional({ description: 'Assignment start date' })
  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Assignment end date' })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'Assignment notes' })
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ApiPropertyOptional({ description: 'Weekly session limit' })
  @Column({ type: 'int', nullable: true })
  weeklySessionLimit?: number;

  @ApiPropertyOptional({ description: 'Monthly session limit' })
  @Column({ type: 'int', nullable: true })
  monthlySessionLimit?: number;

  @ApiProperty({ description: 'Assignment created by (Admin ID)' })
  @Column({ type: 'int' })
  createdBy: number;

  @ApiPropertyOptional({ description: 'Assignment updated by (Admin ID)' })
  @Column({ type: 'int', nullable: true })
  updatedBy?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'clientId' })
  client: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updater?: User;
}
