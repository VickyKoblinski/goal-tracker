import { MailerService } from '@nestjs-modules/mailer';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/mail')
  mail() {
    return this.mailerService.sendMail({
      to: 'user@gmail.com', // List of receivers email address
      from: 'user@outlook.com', // Senders email address
      subject: 'Testing Nest Mailermodule with template ✔',
      template: 'index', // The `.pug` or `.hbs` extension is appended automatically.
      context: {
        // Data to be sent to template engine.
        code: 'cf1a3f828287',
        username: 'john doe',
      },
    });
  }
}
