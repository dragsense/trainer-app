import { User, Profile, UserAvailability } from '../entities';
import { GeneralBaseEntity } from '../entities/common/base.entity';
import { IMessageResponse } from './api/response.interface';


export interface IUser extends User, GeneralBaseEntity {};
export interface IProfile extends Profile, GeneralBaseEntity {}


export interface IUserAvailability extends UserAvailability, GeneralBaseEntity {}

export type TUserResponse = {user: IUser} & IMessageResponse
  