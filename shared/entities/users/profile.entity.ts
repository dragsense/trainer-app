import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { FileUpload } from '../file-uploads/file-upload.entity';
import { GeneralBaseEntity } from '../common/base.entity';
import { EUserGender } from '../../enums/user.enum';

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
  dateOfBirth?: string;

  @ApiPropertyOptional({
    enum: EUserGender,
    example: EUserGender.MALE,
    description: 'User gender',
  })
  @Column({
    type: 'enum',
    enum: EUserGender,
    nullable: true,
  })
  gender?: EUserGender;

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

  @ApiPropertyOptional({ example: 3, description: 'Years of experience as trainer' })
  @Column({ type: 'int', nullable: true })
  experience?: number;

  // ─── Client-Specific Fields ─────────────

  @ApiPropertyOptional({
    example: ['Weight loss', 'Flexibility'],
    description: 'Client fitness goals'
  })
  @Column({ type: 'simple-array', nullable: true })
  fitnessGoals?: string[];

  @ApiPropertyOptional({
    enum: EUserGender,
    example: EUserGender.FEMALE,
    description: 'Preferred trainer gender'
  })
  @Column({ type: 'enum', enum: EUserGender, nullable: true })
  preferredTrainerGender?: EUserGender;

  @ApiProperty({ type: () => User, description: 'Associated user' })
  @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
  user: User;

  @ApiPropertyOptional({
    description: 'File entity for the uploaded image',
    type: () => FileUpload,
  })
  @ManyToOne(() => FileUpload, {
    cascade: true,
    eager: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  image?: FileUpload | null;
}
