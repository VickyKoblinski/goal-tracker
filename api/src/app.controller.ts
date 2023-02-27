import { SendGridService } from './sendgrid/sendgrid.service';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly sendGridService: SendGridService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/mail')
  mail() {
    return this.sendGridService.sendEmailVerification({
      to: 'test@gmail.com',
      name: 'tester',
      verificationCode: '1234',
    });
  }
}
