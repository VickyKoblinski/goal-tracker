import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import Handlers from './app.handlers';

describe('App resolvers (supertest)', () => {
  let app: INestApplication;
  let unauthHandlers: Handlers;
  let authHandlers: Handlers;
  const loginUserInput = {
    username: 'john',
    password: 'changeme',
  };

  beforeAll(async () => {
    app = await createTestApp();
    unauthHandlers = new Handlers(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('register', () => {
    it('creates a new user', async () => {
      const res = await unauthHandlers.register(loginUserInput);

      const { data } = res.body;
      expect(data.register.token).toBeDefined();
    });

    it.skip('cannot create a new user with a shared username', () => {
      // TODO
    });
  });

  describe('login', () => {
    it('get jwt from valid login', async () => {
      const res = await unauthHandlers.login(loginUserInput);

      const { data } = res.body;

      expect(data.login.token).toBeDefined();
      authHandlers = new Handlers(app, data.login.token);
    });

    it('get error from invalid login', async () => {
      const loginUserInput = {
        username: 'john',
        password: 'changeme2',
      };

      const res = await unauthHandlers.login(loginUserInput);
      const { errors } = res.body;

      expect(errors[0].message).toBe('Unauthorized');
    });
  });

  describe('whoAmI', () => {
    it('returns current user', async () => {
      const res = await authHandlers.whoAmI();
      expect(res.body.data.whoAmI.username).toEqual('john');
      expect(typeof res.body.data.whoAmI.id).toBe('string');
    });

    it('is unauthorized if bad token is sent', async () => {
      const res = await unauthHandlers.whoAmI();
      const { errors } = res.body;

      expect(errors[0].message).toBe('Unauthorized');
    });
  });
});

async function createTestApp() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();

  return app;
}
