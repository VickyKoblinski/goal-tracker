import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import * as sgClient from '@sendgrid/client';

@Injectable()
export class SendGridService {
  constructor(private readonly configService: ConfigService) {
    if (process.env.NODE_ENV !== 'prod') {
      SendGrid.setApiKey(this.configService.get<string>('MOCK_SEND_GRID_KEY'));
      sgClient.setDefaultRequest(
        'baseUrl',
        this.configService.get<string>('MOCK_SEND_GRID_URL'),
      );
      SendGrid.setClient(sgClient);
    } else {
      SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
    }
  }

  async send(mail: SendGrid.MailDataRequired) {
    const transport = await SendGrid.send(mail);
    return transport;
  }

  sendEmailVerification({
    to,
    name,
    verificationToken,
  }: {
    to: string;
    name: string;
    verificationToken: string;
  }) {
    return this.send({
      from: this.configService.get<string>('SEND_GRID_FROM_NOREPLY'),
      to,
      templateId: this.configService.get<string>(
        'SEND_GRID_TEMPLATE_VERIFY_EMAIL',
      ),
      dynamicTemplateData: {
        name,
        verificationToken,
        baseUrl: this.configService.get<string>('SEND_GRID_BASE_URL'),
      },
    });
  }
}
