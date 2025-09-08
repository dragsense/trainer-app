import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'CRM_WEB_APP',

  appUrl: process.env.APP_URL || 'http://localhost:5173',
  loginPath: process.env.LOGIN_PATH || 'login',
  passwordResetPath: process.env.PASSWORD_RESET_PATH || 'reset-password',
  
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.NODE_ENV || 'development',

  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:5173',
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@trainer-app.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'Admin123!',
    firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
    lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
  },
}));
