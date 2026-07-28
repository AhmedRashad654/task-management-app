import { Global, Module } from '@nestjs/common';
import { MailjetProvider } from './mailjet.provider.js';

export const EMAIL_PROVIDER = 'EMAIL_PROVIDER';

@Global()
@Module({
  providers: [
    {
      provide: EMAIL_PROVIDER,
      useClass: MailjetProvider,
    },
  ],
  exports: [EMAIL_PROVIDER],
})
export class EmailModule {}
