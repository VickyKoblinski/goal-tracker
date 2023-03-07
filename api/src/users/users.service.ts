import { ResetPassword } from './entities/reset-password.entity';
import { EmailVerification } from './entities/email-verification.entity';
import {
  Injectable,
  MethodNotAllowedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private emailVerification: Repository<EmailVerification>,
    @InjectRepository(ResetPassword)
    private resetPassword: Repository<ResetPassword>,
  ) {}

  async create(createUserInput: CreateUserInput) {
    const emailVerification = this.emailVerification.create();
    const user = this.userRepository.create({
      ...createUserInput,
      emailVerification,
    });
    emailVerification.user = user;

    await this.dataSource.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.save(emailVerification);
        await transactionalEntityManager.save(user);
      },
    );

    return user;
  }

  // findAll() {
  //   return `This action returns all users`;
  // }

  findOne(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  findVerificationToken(emailVerificationToken: string) {
    return this.emailVerification.findOne({
      where: { emailVerificationToken },
    });
  }

  async setEmailVerified(user, emailVerificationToken: string) {
    const { emailVerification } = user;

    if (!emailVerification) throw new BadRequestException('token not found');
    if (emailVerification.emailVerificationToken !== emailVerificationToken)
      throw new BadRequestException('invalid token');

    // Check expiration, throw error if expired
    if (emailVerification.expires < new Date())
      throw new MethodNotAllowedException('token expired');

    emailVerification.emailVerified = true;
    await this.emailVerification.save(emailVerification);
    return emailVerification;
  }

  async createResetPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { resetPassword: true },
    });

    const resetPassword = this.resetPassword.create();
    user.resetPassword = resetPassword;
    await this.userRepository.save(user);
    return user;
  }

  // update(id: number, updateUserInput: UpdateUserInput) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
