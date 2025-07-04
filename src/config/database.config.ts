import { registerAs } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MongooseOptions } from 'mongoose';

export default registerAs('database', () => ({

  postgres: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
    logging: process.env.TYPEORM_LOGGING === 'true',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      idle: parseInt(process.env.DB_POOL_IDLE || '30000', 10),
      connTimeout: parseInt(process.env.DB_POOL_CONN_TIMEOUT || '5000', 10),
    },
  },



  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB_NAME,
    auth: process.env.MONGO_USER && process.env.MONGO_PASS ? { username: process.env.MONGO_USER, password: process.env.MONGO_PASS } : undefined,
    retryAttempts: parseInt(process.env.MONGO_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.MONGO_RETRY_DELAY || '1000', 10),

  },
}));

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const postgresConfig = configService.get('database.postgres');

  return {
    type: 'postgres',
    host: postgresConfig.host,
    port: postgresConfig.port,
    username: postgresConfig.username,
    password: postgresConfig.password,
    database: postgresConfig.name,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    synchronize: postgresConfig.synchronize,
    logging: postgresConfig.logging,
    extra: {
      max: postgresConfig.pool.max,
      min: postgresConfig.pool.min,
      idleTimeoutMillis: postgresConfig.pool.idle,
      connectionTimeoutMillis: postgresConfig.pool.connTimeout,
    },
    // SSL configuration example (uncomment if needed)
    // ssl: configService.get<string>('NODE_ENV') === 'production' 
    //   ? { rejectUnauthorized: false } 
    //   : false,
  };
};


// Mongoose Configuration
export const getMongooseConfig = (
  configService: ConfigService
): MongooseModuleOptions => {
  const mongoConfig = configService.get('database.mongodb');

  return {
    uri: mongoConfig.uri,
    dbName: mongoConfig.dbName,
    retryAttempts: mongoConfig.retryAttempts,
    retryDelay: mongoConfig.retryDelay,
    auth: mongoConfig.auth,
  };
};