import {
  Entity,
  Column,
  OneToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { UserGender } from '../../enums/user.enum';
import { User } from '../../entities/user.entity';

@Entity('profiles')
export class Profile extends GeneralBaseEntity {
  // ─── Shared Fields ─────────────────────

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number with country code' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '1990-01-01', description: 'Date of birth' })
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    enum: UserGender,
    example: UserGender.MALE,
    description: 'User gender',
  })
  @Column({
    type: 'enum',
    enum: UserGender,
    nullable: true,
  })
  gender?: UserGender;

  @ApiPropertyOptional({ example: '123 Main St, City, Country', description: 'User address' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/avatar.jpg',
    description: 'User avatar URL'
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  // ─── Trainer-Specific Fields ────────────

  @ApiPropertyOptional({ example: 'Experienced fitness trainer...', description: 'User bio' })
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @ApiPropertyOptional({
    example: ['Yoga', 'Personal Training'],
    description: 'Trainer specialties'
  })
  @Column({ type: 'simple-array', nullable: true })
  specialties?: string[];

  @ApiPropertyOptional({
    example: ['Certified Personal Trainer (CPT)'],
    description: 'Trainer certifications'
  })
  @Column({ type: 'simple-array', nullable: true })
  certifications?: string[];

  @ApiPropertyOptional({
    example: ['Zone A', 'Zone B'],
    description: 'Trainer working zones'
  })
  @Column({ type: 'simple-array', nullable: true })
  availabilityZones?: string[];

  @ApiPropertyOptional({
    example: ['Mon 9-11', 'Wed 3-5'],
    description: 'Trainer available time slots'
  })
  @Column({ type: 'simple-array', nullable: true })
  availableTimeSlots?: string[];

  @ApiPropertyOptional({ example: 3, description: 'Years of experience as trainer' })
  @Column({ type: 'int', nullable: true })
  experience?: number;

  @ApiPropertyOptional({ example: 4.5, description: 'Trainer rating (0-5)' })
  @Column({ type: 'float', nullable: true })
  rating?: number;

  // ─── Client-Specific Fields ─────────────

  @ApiPropertyOptional({
    example: ['Weight loss', 'Flexibility'],
    description: 'Client fitness goals'
  })
  @Column({ type: 'simple-array', nullable: true })
  fitnessGoals?: string[];

  @ApiPropertyOptional({
    enum: UserGender,
    example: UserGender.FEMALE,
    description: 'Preferred trainer gender'
  })
  @Column({ type: 'enum', enum: UserGender, nullable: true })
  preferredTrainerGender?: UserGender;

  @ApiPropertyOptional({
    example: ['Morning', 'Evening'],
    description: 'Preferred workout times'
  })
  @Column({ type: 'simple-array', nullable: true })
  preferredWorkoutTimes?: string[];

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  user: User;
}
