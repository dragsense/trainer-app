import { registerAs } from '@nestjs/config';

import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';

export default registerAs('mailer', () => ({
  from: process.env.MAIL_FROM,
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
}));



export const getMailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.get<string>('mailer.host'),
    port: configService.get<number>('mailer.port'),
    auth: {
      user: configService.get<string>('mailer.user'),
      pass: configService.get<string>('mailer.pass'),
    },
  },
  defaults: {
    from: `"${configService.get<string>('app.name')}" <${configService.get<string>('mailer.from')}>`,
  },
});
