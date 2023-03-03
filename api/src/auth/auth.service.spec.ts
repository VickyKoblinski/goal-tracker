import { EmailVerification } from './../users/entities/email-verification.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@/users/entities/user.entity';
import * as encrypt from './encrypt';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendGridService } from '@/sendgrid/sendgrid.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn<User, []>(),
          },
        },
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
          useValue: {},
        },
        {
          provide: SendGridService,
          useValue: {
            sendEmailVerification: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object if credentials are valid', async () => {
      const user = new User();
      user.id = '1234-14123-13134';
      user.username = 'testuser';
      user.password = 'testpass';
      const findOneSpy = jest
        .spyOn(usersService, 'findOneByEmail')
        .mockResolvedValue(user);
      jest.spyOn(encrypt, 'comparePassword').mockResolvedValue(true);

      const result = await authService.validateUser('testuser', 'testpass');

      expect(findOneSpy).toHaveBeenCalledWith('testuser');
      expect(result).toEqual({ username: user.username, id: user.id });
    });

    it('should return null if credentials are invalid', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

      const result = await authService.validateUser('testuser', 'testpass');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate a JWT token', async () => {
      const user = new User();
      const signSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user);

      const result = await authService.login({
        username: 'testuser',
        userId: 1,
      });

      expect(signSpy).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 1,
      });
      expect(result).toEqual({ access_token: 'token', user });
    });
  });

  describe('register', () => {
    it('should return a jwt when a user signs up', async () => {
      const signSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      const user = new User();
      user.password = 'hashed';
      user.email = 'myemail@email.com';
      user.username = 'testuser';
      user.id = 'USER_ID';
      user.emailVerification = new EmailVerification();
      jest.spyOn(usersService, 'create').mockResolvedValue(user);
      const result = await authService.register({
        username: 'testuser',
        password: 'testpass',
        email: 'myemail@email.com',
      });
      expect(signSpy).toHaveBeenCalledWith({
        username: 'testuser',
        sub: 'USER_ID',
      });
      expect(result).toEqual({ accessToken: 'token', user });
    });
  });
});
