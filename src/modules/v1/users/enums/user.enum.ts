export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TRAINER = 'TRAINER',
  USER = 'USER',
}

export const UserLevels = {
  [UserRole.SUPER_ADMIN]: 0,
  [UserRole.TRAINER]: 1,
  [UserRole.USER]: 2,
};


export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
