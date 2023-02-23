import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Goal resolvers (supertest)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createGoal', () => {
    it('should create and return a goal', async () => {
      const createGoalInput = {
        name: 'My Goal',
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateGoal($createGoalInput: CreateGoalInput!) {
              createGoal(createGoalInput: $createGoalInput) {
                id
                name
              }
            }
          `,
          variables: { createGoalInput },
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      const { data } = res.body;

      expect(data.createGoal.id).toBeDefined();
      expect(data.createGoal.name).toBe(createGoalInput.name);
    });
  });

  describe('findAll', () => {
    it('should return an array of goals', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query FindAllGoals {
              goals {
                id
                name
              }
            }
          `,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      const { data } = res.body;
      expect(data.goals).toBeDefined();
      expect(data.goals.length).toBe(1);
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
