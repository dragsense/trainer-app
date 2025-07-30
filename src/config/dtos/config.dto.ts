import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
}

export class EnvironmentVariables {
  // Application
  @IsString()
  APP_NAME: string;

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  HOST: string;

  @IsNumber()
  PORT: number;

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  FRONTEND_LOGIN_PATH: string;

  @IsString()
  FRONTEND_PASSWORD_RESET_PATH: string;

  // Database
  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASS: string;

  @IsString()
  DB_NAME: string;

  @IsBoolean()
  TYPEORM_SYNCHRONIZE: boolean;

  @IsBoolean()
  TYPEORM_LOGGING: boolean;

  // DB Pool
  @IsNumber()
  @IsOptional()
  DB_POOL_SIZE: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_MAX: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_MIN: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_IDLE: number;

  @IsNumber()
  @IsOptional()
  DB_POOL_CONN_TIMEOUT: number;

  // JWT
  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  // Mailer
  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  MAIL_PORT: number;

  @IsOptional()
  @IsString()
  MAIL_USER: string;

  @IsOptional()
  @IsString()
  MAIL_PASS: string;

  @IsString()
  MAIL_FROM: string;

  // Super Admin
  @IsString()
  SUPER_ADMIN_EMAIL: string;

  @IsString()
  SUPER_ADMIN_PASSWORD: string;

  @IsString()
  SUPER_ADMIN_FIRST_NAME: string;

  @IsString()
  SUPER_ADMIN_LAST_NAME: string;

  
}
