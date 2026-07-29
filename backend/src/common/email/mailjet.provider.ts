import {
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';
import type { IEmailProvider } from './email.interface.js';

@Injectable()
export class MailjetProvider implements IEmailProvider {
  private readonly client: any;

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    this.client = new (Mailjet as any)({
      apiKey: this.configService.getOrThrow<string>('MAILJET_API_KEY'),
      apiSecret: this.configService.getOrThrow<string>('MAILJET_SECRET_KEY'),
    });
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.client.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email:
                this.configService.getOrThrow<string>('MAILJET_FROM_EMAIL'),
              Name: this.configService.getOrThrow<string>('MAILJET_FROM_NAME'),
            },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });
    } catch {
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}
