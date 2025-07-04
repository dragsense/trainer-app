export enum UserRole {
  ADMIN = 'ADMIN',
  TRAINER = 'TRAINER',
  CLIENT = 'CLIENT',
}

export const UserLevels = {
  [UserRole.ADMIN]: 3,
  [UserRole.TRAINER]: 2,
  [UserRole.CLIENT]: 1,
};

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
