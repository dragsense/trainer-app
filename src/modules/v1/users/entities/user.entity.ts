import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Session } from '../../sessions/entities/session.entity';
import { UserRole } from '@/common/enums/role.enum';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Reminder } from '../../reminders/entities/reminder.entity';

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

  @ApiProperty({ description: 'User role (ADMIN/TRAINER/CLIENT)' })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @ApiProperty({ description: 'User profile information' })
  @OneToOne(() => Profile, (profile) => profile.user)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Session, (session: Session) => session.trainer)
  @ApiProperty({ type: () => [Session], description: 'Sessions created by the trainer' })
  createdSessions: Session[];

  @OneToMany(() => Session, (session: Session) => session.client)
  @ApiProperty({ type: () => [Session], description: 'Sessions booked by the client' })
  clientSessions: Session[];

  @OneToMany(() => PaymentMethod, (paymentMethod: PaymentMethod) => paymentMethod.user)
  @ApiProperty({ type: () => [PaymentMethod], description: 'Payment methods associated with the user' })
  paymentMethods: PaymentMethod[];

  @OneToMany(() => Payment, (payment: Payment) => payment.client)
  @ApiProperty({ type: () => [Payment], description: 'Payments made by the user' })
  payments: Payment[];

  @OneToMany(() => Reminder, (reminder: Reminder) => reminder.creator)
  @ApiProperty({ type: () => [Reminder], description: 'Reminders created by the user' })
  createdReminders: Reminder[];

  @OneToMany(() => Reminder, (reminder: Reminder) => reminder.recipient)
  @ApiProperty({ type: () => [Reminder], description: 'Reminders received by the user' })
  receivedReminders: Reminder[];
}
