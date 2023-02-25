import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from 'src/users/dto/create-user.input';
import { UsersService } from '../users/users.service';
import { hashPassword, comparePassword } from './encrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await comparePassword(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserInput: CreateUserInput) {
    const hashedPassword = await hashPassword(createUserInput.password);
    const newUser = await this.usersService.create({
      username: createUserInput.username,
      password: hashedPassword,
    });
    return {
      access_token: this.jwtService.sign({
        username: newUser.username,
        sub: newUser.id,
      }),
    };
  }
}
