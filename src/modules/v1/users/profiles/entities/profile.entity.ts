import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { GeneralBaseEntity } from '@/base-entity/base.entity';


import { UserGender } from '../../enums/user.enum';
import { User } from '../../entities/user.entity';


@Entity('profiles')
export class Profile extends GeneralBaseEntity {

    @ApiProperty({ example: 'John', description: 'First name of the user' })
    @Column({ type: 'varchar', length: 100 })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
    @Column({ type: 'varchar', length: 100 })
    lastName: string; 

    @ApiProperty({
        example: UserGender.MALE,
        description: 'Gender of the user',
        enum: UserGender,
    })
    @Column({
        type: 'enum',
        enum: UserGender,
        nullable: true,
    })
    gender: UserGender;

    @ApiProperty({ example: '123 Main St', description: 'Street address' })
    @Column({ type: 'varchar', length: 255, default: '' })
    address: string;

    @ApiProperty({
        example: '+1-202-555-0173',
        description: 'Contact phone number',
    })
    @Column({ type: 'varchar', length: 20, default: '' })
    contactPhone: string;

    @OneToOne(() => User, (user) => user.profile, { onDelete: 'RESTRICT' })
    user: User;
}
