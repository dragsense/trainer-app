import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('trainer_clients')
export class TrainerClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  trainerId: number;

  @Column()
  clientId: number;

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
