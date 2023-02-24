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

    it('should create a subgoal', async () => {
      const createGoalInput = {
        name: 'My sub Goal',
        parent: '1',
      };

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          mutation CreateGoal($createGoalInput: CreateGoalInput!) {
            createGoal(createGoalInput: $createGoalInput) {
              id
              name
              parent {
                name
              }
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
      expect(data.createGoal.parent.name).toBe('My Goal');
    });
  });

  describe('find', () => {
    it('should have child goals', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
          query FindGoal($id: ID!) {
            goal(id: $id) {
              id
              name
              children {
                name
                id
              }
            }
          }
        `,
          variables: { id: '1' },
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      const { data } = res.body;
      expect(data.goal.id).toBeDefined();
      expect(data.goal.name).toBe('My Goal');
      expect(data.goal.children).toBeDefined();
      expect(data.goal.children.length).toBe(1);
      expect(data.goal.children[0].name).toBe('My sub Goal');
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
      expect(data.goals.length).toBe(2);
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
