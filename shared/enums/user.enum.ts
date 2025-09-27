export enum EUserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TRAINER = 'TRAINER',
  USER = 'USER',
}

export const EUserLevels = {
  [EUserRole.SUPER_ADMIN]: 0,
  [EUserRole.TRAINER]: 1,
  [EUserRole.USER]: 2,
};

export enum EUserGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}
