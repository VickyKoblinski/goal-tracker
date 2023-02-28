import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/verify')
  async verifyEmail(@Query('token') emailVerificationToken) {
    if (!emailVerificationToken) return null;
    await this.authService.validateEmail(emailVerificationToken);
    return 'Verified!';
  }
}
