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

  describe('remove', () => {
    beforeEach(async () => {
      app = await createTestApp();
    });

    afterEach(async () => {
      await app.close();
    });

    it('should remove a goal that does not have children or a parent', async () => {
      // Create a goal
      const createGoalInput = {
        name: 'My sub Goal',
      };

      const createRes = await request(app.getHttpServer())
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
        .set('Accept', 'application/json');
      const { data: resData } = createRes.body;

      // Delete goal
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteGoal($deleteGoalInput: DeleteGoalInput!) {
              deleteGoal(deleteGoalInput: $deleteGoalInput) {
                id
              }
            }
          `,
          variables: { deleteGoalInput: { id: resData.createGoal.id } },
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      const { data: deletedData } = res.body;

      expect(deletedData.deleteGoal.id).toBeDefined();
      expect(deletedData.deleteGoal.id).toBe('1');

      // Fetch all goals
      const resGoals = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query FindAllGoals {
              goals {
                id
              }
            }
          `,
        })
        .set('Accept', 'application/json');

      const { data } = resGoals.body;
      expect(data.goals).toBeDefined();
      expect(data.goals.length).toBe(0);
    });

    it("should throw an error when trying to delete a goal that doesn't exist", async () => {
      // Delete goal
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteGoal($deleteGoalInput: DeleteGoalInput!) {
              deleteGoal(deleteGoalInput: $deleteGoalInput) {
                id
              }
            }
          `,
          variables: { deleteGoalInput: { id: '1' } },
        })
        .set('Accept', 'application/json')

        .expect(200);
      const { errors } = res.body;
      expect(errors).toMatchObject([
        {
          message: 'goal not found',
          extensions: {
            code: '404',
            response: {
              statusCode: 404,
              message: 'goal not found',
              error: 'Not Found',
            },
          },
        },
      ]);
    });

    it('cannot delete a goal that has children', async () => {
      // Create a goal
      await request(app.getHttpServer())
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
          variables: {
            createGoalInput: {
              name: 'My Goal',
            },
          },
        })
        .set('Accept', 'application/json');

      // Create child goal
      await request(app.getHttpServer())
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
          variables: {
            createGoalInput: {
              name: 'My sub Goal',
              parent: '1',
            },
          },
        })
        .set('Accept', 'application/json');

      // Delete goal
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteGoal($deleteGoalInput: DeleteGoalInput!) {
              deleteGoal(deleteGoalInput: $deleteGoalInput) {
                id
              }
            }
          `,
          variables: { deleteGoalInput: { id: '1' } },
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      const { errors } = res.body;
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'cannot delete goal with children, use FORCE or CASCADE to delete',
      );
    });

    it('removes parent and all children', async () => {
      // Create a goal
      await request(app.getHttpServer())
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
          variables: {
            createGoalInput: {
              name: 'My Goal',
            },
          },
        })
        .set('Accept', 'application/json');

      // Create child goal
      await request(app.getHttpServer())
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
          variables: {
            createGoalInput: {
              name: 'My sub Goal',
              parent: '1',
            },
          },
        })
        .set('Accept', 'application/json');

      // Delete goal
      const deleteGoalInput = { id: 1, recursive: true };
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteGoal($deleteGoalInput: DeleteGoalInput!) {
              deleteGoal(deleteGoalInput: $deleteGoalInput) {
                id
              }
            }
          `,
          variables: {
            deleteGoalInput,
          },
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      const { data } = res.body;
      expect(data).not.toBeNull();
      expect(data.deleteGoal.id).toBe('1');
    });

    it('removes parent relationship on delete', () => {});
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
