import { UserGender } from '../enums/user.enum';

export interface UserProfile {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: UserGender;
  address?: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
  avatar?: string;
}
