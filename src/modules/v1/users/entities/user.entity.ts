import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Session } from '../../sessions/entities/session.entity';

import { UserLevels, UserRole } from '../enums/user.enum';
import { Reminder } from '../../reminders/entities/reminder.entity';
import { Billing } from '../../billings/entities/billing.entity';
import { UserAvailability } from './user-availability.entity';
import { StripeConnectAccount } from '../../settings/stripe-connect/entities/stripe-connect-account.entity';


export type UserLevelType = typeof UserLevels[UserRole];
export const UserLevelValues = Object.values(UserLevels);


@Entity('users')
export class User extends GeneralBaseEntity {

  @ApiProperty({
    example: 'email@example.com',
    description: "user's email address",
  })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @ApiProperty({ example: 'secrete', description: "user's password" })
  @Column({ type: 'varchar', length: 100, select: false })
  password: string;

  @ApiProperty({
    example: UserLevels[UserRole.TRAINER],
    enum: UserLevelValues,
    description: 'User role',
  })
  @Column({ type: 'int', nullable: false })
  level: UserLevelType;


  @ApiPropertyOptional({ example: true, description: 'Trainer active status' })
  @Column({ type: 'boolean', default: true })
  isActive?: boolean;

  @ManyToOne(() => User, (user) => user.createdUsers, {
    onDelete: 'RESTRICT',
    nullable: true,
  })
  owner: User;


  @OneToMany(() => User, (user) => user.owner)
  createdUsers: User[];


  // Other relationships
  @OneToOne(() => Profile)
  @JoinColumn()
  profile?: Profile;

  @OneToMany(() => Billing, (billing) => billing.user)
  billings: Billing[];


  @OneToMany(() => Session, session => session.clients)
  clientSessions?: Session[];

  @OneToMany(() => Session, session => session.trainer)
  trainerSessions?: Session[];


  @OneToMany(() => Reminder, reminder => reminder.creator)
  createdReminders?: Reminder[];

  @OneToMany(() => Reminder, reminder => reminder.recipient)
  reminders?: Reminder[];

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string;

  @ApiProperty({
    type: () => UserAvailability,
    description: "Availability record of the staff",
    required: false,
  })
  @OneToOne(() => UserAvailability, (availability) => availability.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  availability: UserAvailability;

  @ApiProperty({
    type: () => StripeConnectAccount,
    description: "Stripe Connect account of the trainer",
    required: false,
  })
  @OneToOne(() => StripeConnectAccount, (stripeConnect) => stripeConnect.user, {
    cascade: true,
  })
  stripeConnectAccount: StripeConnectAccount;

}
