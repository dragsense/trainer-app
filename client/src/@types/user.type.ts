import { User } from "#/modules/v1/users/entities/user.entity";
import { GeneralBaseEntity } from "#/base-entity/base.entity";

import { CreateUserDto } from "#/modules/v1/users/dto/create-user.dto";


export interface IUser extends User, GeneralBaseEntity {};


export type TUserData = {} & Omit<CreateUserDto, 'trainerId'>;
