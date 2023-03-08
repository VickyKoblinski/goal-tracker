import { SendGridService } from './../sendgrid/sendgrid.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '@/users/dto/create-user.input';
import { UsersService } from '@/users/users.service';
import { comparePassword, hashPassword } from './encrypt';
import { User } from '@/users/entities/user.entity';
import { SubmitResetPasswordInput } from '@/users/dto/submit-reset-password.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly sendGridService: SendGridService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
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

  async validateEmail(user: User, verificationToken: string) {
    return this.usersService.setEmailVerified(user, verificationToken);
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    const dbUser = await this.usersService.findOneByEmail(user.username);

    return {
      access_token: this.jwtService.sign(payload),
      user: dbUser,
    };
  }

  async register(createUserInput: CreateUserInput) {
    createUserInput.password = hashPassword(createUserInput.password);
    const newUser = await this.usersService.create(createUserInput);
    await this.sendGridService.sendEmailVerification({
      to: newUser.email,
      name: newUser.username,
      verificationToken: newUser.emailVerification.emailVerificationToken,
    });
    return {
      accessToken: this.jwtService.sign({
        username: newUser.username,
        sub: newUser.id,
      }),
      user: newUser,
    };
  }

  async resetPassword(email: string) {
    const user = await this.usersService.createResetPassword(email);
    await this.sendGridService.sendResetPassword({
      to: user.email,
      name: user.username,
      verificationToken: user.resetPassword.emailVerificationToken,
    });
    return user;
  }

  async submitResetPassword(
    submitResetPasswordInput: SubmitResetPasswordInput,
  ) {
    submitResetPasswordInput.newPassword = hashPassword(
      submitResetPasswordInput.newPassword,
    );
    return this.usersService.submitResetPassword(submitResetPasswordInput);
  }
}
