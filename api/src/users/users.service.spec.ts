import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './entities/email-verification.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;
  let emailVerificationRepository: Repository<EmailVerification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(EmailVerification),
          useClass: Repository,
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            manager: {
              transaction: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    emailVerificationRepository = module.get<Repository<EmailVerification>>(
      getRepositoryToken(EmailVerification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the user with the specified username', async () => {
      const username = 'john';

      const expectedUser: User = {
        id: '134-13-141',
        username: 'john',
        password:
          '$2b$10$Dot1qjkYa5IXEs80gzTWQ.Xw.IFgcYat31FhCGIL1m3MueNO9Fxde',
        emailVerification: new EmailVerification(),
      };

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(expectedUser);

      const result = await service.findOne(username);

      expect(result).toEqual(expectedUser);
    });

    it('should return undefined if the user is not found', async () => {
      const username = 'nonexistent';
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
      const result = await service.findOne(username);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates a new user', async () => {
      const user = new User();
      user.username = 'testuser';
      user.password = 'testpass';
      user.id = '1';

      jest.spyOn(usersRepository, 'create').mockReturnValue(user);
      jest
        .spyOn(emailVerificationRepository, 'create')
        .mockReturnValue(new EmailVerification());

      const newUser = await service.create({
        username: 'testuser',
        password: 'testpass',
      });
      expect(newUser).toMatchObject({
        username: 'testuser',
        password: 'testpass',
        id: '1',
      });
    });
  });
});
