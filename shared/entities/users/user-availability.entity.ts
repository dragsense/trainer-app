import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('user-availabilities')
export class UserAvailability {
    @ApiProperty({ example: 1, description: "Unique identifier of the availability" })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        type: () => User,
        description: "User associated with this availability",
    })
    @OneToOne(() => User, (user) => user.availability, { onDelete: 'CASCADE' })
    user: User;

    @ApiProperty({
        type: () => Object,
        description: "Weekly schedule for the user, with each day containing a DayScheduleDto",
        example: {
            monday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            tuesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            wednesday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            thursday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            friday: { enabled: true, timeSlots: [{ start: "09:00", end: "17:00" }] },
            saturday: { enabled: false, timeSlots: [] },
            sunday: { enabled: false, timeSlots: [] },
        }
    })
    @Column({ type: 'jsonb' })
    weeklySchedule: {
        monday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
        tuesday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
        wednesday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
        thursday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
        friday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
        saturday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
        sunday: {
            enabled: boolean;
            timeSlots: Array<{
                start: string;
                end: string;
            }>;
        };
    };

    @ApiProperty({
        type: [Object],
        description: "Array of unavailable periods for the user",
        example: [
            { startDate: "2024-03-01T09:00:00.000Z", endDate: "2024-03-01T12:00:00.000Z", reason: "Doctor appointment" },
            { startDate: "2024-03-05T14:00:00.000Z", endDate: "2024-03-05T16:00:00.000Z", reason: "Personal" }
        ]
    })
    @Column({ type: 'jsonb', default: [] })
    unavailablePeriods: Array<{
        id?: string;
        reason: string;
        startDate: Date;
        endDate: Date;
    }>;

    @ApiProperty({
        example: "2024-02-13T10:45:00.000Z",
        description: "Timestamp when the availability was created",
    })
    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @ApiProperty({
        example: "2024-02-13T10:45:00.000Z",
        description: "Timestamp when the user was last updated",
    })
    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
