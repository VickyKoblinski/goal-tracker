import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 1,
      username: 'john',
      password: '$2b$10$Dot1qjkYa5IXEs80gzTWQ.Xw.IFgcYat31FhCGIL1m3MueNO9Fxde',
    },
    {
      id: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  create(createUserInput: CreateUserInput) {
    const newUser = new User();
    newUser.id = this.users.length;
    newUser.password = createUserInput.password;
    newUser.username = createUserInput.username;

    this.users.push(newUser);
    return newUser;
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  async findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }

  // update(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
