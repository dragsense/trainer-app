import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('trainer_client')
export class TrainerClient extends GeneralBaseEntity {
  
  @ApiProperty({ description: 'Trainer ID' })
  @Column()
  trainerId: number;

  @ApiProperty({ description: 'Client ID' })
  @Column()
  clientId: number;

  @ApiProperty({ description: 'Assignment creation date' })
  @CreateDateColumn()
  assignedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'trainerId' })
  trainer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'clientId' })
  client: User;
}
