import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SEND_GRID_KEY'));
  }

  async send(mail: SendGrid.MailDataRequired) {
    const transport = await SendGrid.send(mail);
    return transport;
  }

  sendEmailVerification({
    to,
    name,
    verificationCode,
  }: {
    to: string;
    name: string;
    verificationCode: string;
  }) {
    return this.send({
      from: this.configService.get<string>('SEND_GRID_FROM_NOREPLY'),
      to,
      templateId: this.configService.get<string>(
        'SEND_GRID_TEMPLATE_VERIFY_EMAIL',
      ),
      dynamicTemplateData: {
        name,
        verificationCode,
      },
    });
  }
}
