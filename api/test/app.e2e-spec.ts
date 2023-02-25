import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import Handlers from './app.handlers';

describe('Goal resolvers (supertest)', () => {
  let app: INestApplication;
  let unauthHandlers: Handlers;
  let authHandlers: Handlers;

  beforeAll(async () => {
    app = await createTestApp();
    unauthHandlers = new Handlers(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('login', () => {
    it('get jwt from valid login', async () => {
      const loginUserInput = {
        username: 'john',
        password: 'changeme',
      };

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
      expect(res.body.data.whoAmI).toEqual({
        id: '1',
        username: 'john',
      });
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
