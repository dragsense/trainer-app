import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'CRM_WEB_APP',

  frontendURL: process.env.FRONTEND_URL,
  frontendLoginPath: process.env.FRONTEND_LOGIN_PATH || '/login',
  frontendPasswordResetPath: process.env.FRONTEND_PASSWORD_RESET_PATH || '/reset-password',
  
  host: process.env.HOST || 'localhost',
  port: parseInt(process.env.PORT ?? '3000', 10),
  env: process.env.NODE_ENV || 'development',
}));
