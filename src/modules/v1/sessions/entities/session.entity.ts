import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { SessionStatus } from '../enums/session.eum';
import { GeneralBaseEntity } from '@/base-entity/base.entity';

@Entity('sessions')
export class Session extends GeneralBaseEntity {

  @ApiProperty({ description: 'Title of the session' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Date and time of the session' })
  @Column({ type: 'timestamp' })
  dateTime: Date;

  @ApiProperty({ description: 'Duration of the session in minutes' })
  @Column()
  duration: number;

  @ApiProperty({ description: 'Session status (scheduled, completed, cancelled)' })
  @Column({ type: 'enum', enum: SessionStatus, default: 'scheduled' })
  status: SessionStatus;

  @ApiProperty({ description: 'Description or notes about the session' })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user: User) => user.createdSessions)
  @ApiProperty({ type: () => User, description: 'Trainer who created the session' })
  trainer: User;

  @ManyToOne(() => User, (user: User) => user.clientSessions)
  @ApiProperty({ type: () => User, description: 'Client for whom the session is scheduled' })
  client: User;

  @OneToMany(() => Payment, (payment: Payment) => payment.session)
  @ApiProperty({ type: () => [Payment], description: 'Payments related to this session' })
  payments: Payment[];

  @OneToMany(() => Reminder, (reminder: Reminder) => reminder.session)
  @ApiProperty({ type: () => [Reminder], description: 'Reminders related to this session' })
  reminders: Reminder[];

}
