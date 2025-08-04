import { GeneralBaseEntity } from '@/base-entity/base.entity';
import { User } from '@/modules/v1/users/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('stripe_connect_accounts')
export class StripeConnectAccount extends GeneralBaseEntity {
    @Column({ type: 'varchar', length: 255, unique: true })
    stripeAccountId: string;

    @Column({ type: 'varchar', length: 10, default: 'express' })
    type: 'express' | 'standard';

    @Column({ type: 'varchar', length: 5, default: 'US' })
    country: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'boolean', default: false })
    chargesEnabled: boolean;

    @Column({ type: 'boolean', default: false })
    detailsSubmitted: boolean;

    @Column({ type: 'boolean', default: false })
    payoutsEnabled: boolean;

    @OneToOne(() => User, user => user.stripeConnectAccount)
    @JoinColumn()
    user: User;

    @Column()
    userId: number;

    get isComplete(): boolean {
        return this.detailsSubmitted && this.chargesEnabled;
    }
}
