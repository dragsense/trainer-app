import { registerAs } from '@nestjs/config';

import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
}));



export const getJwtConfig = async (
  configService: ConfigService,
): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('jwt.secret'),
  signOptions: {
    expiresIn: configService.get<string>('jwt.expiresIn'),
  },
});
