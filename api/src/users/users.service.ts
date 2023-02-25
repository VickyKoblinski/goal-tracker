import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // private readonly users: User[] = [
  //   {
  //     id: 1,
  //     username: 'john',
  //     password: '$2b$10$Dot1qjkYa5IXEs80gzTWQ.Xw.IFgcYat31FhCGIL1m3MueNO9Fxde',
  //   },
  //   {
  //     id: 2,
  //     username: 'maria',
  //     password: 'guess',
  //   },
  // ];

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const user = this.userRepository.create(createUserInput);
    this.userRepository.save(user);
    return user;
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOne(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  // update(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
