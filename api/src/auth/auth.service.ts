import { SendGridService } from './../sendgrid/sendgrid.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '@/users/dto/create-user.input';
import { UsersService } from '@/users/users.service';
import { comparePassword } from './encrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly sendGridService: SendGridService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await comparePassword(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async hasValidatedEmail(username: string) {
    const user = await this.usersService.findOne(username);
    return user.emailVerification.emailVerified;
  }

  async validateEmail(verificationToken: string) {
    return this.usersService.setEmailVerified(verificationToken);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserInput: CreateUserInput) {
    const newUser = await this.usersService.create(createUserInput);
    await this.sendGridService.sendEmailVerification({
      to: newUser.email,
      name: newUser.username,
      verificationToken: newUser.emailVerification.emailVerificationToken,
    });
    return {
      access_token: this.jwtService.sign({
        username: newUser.username,
        sub: newUser.id,
      }),
    };
  }
}
