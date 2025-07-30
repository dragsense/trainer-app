export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  USER = 'USER',
}

export const UserLevels = {
  [UserRole.SUPER_ADMIN]: 0,
  [UserRole.ADMIN]: 1,
  [UserRole.TRAINER]: 2,
  [UserRole.USER]: 3,
};


export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
