import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import Handlers from './goals.handlers';

describe('Goal resolvers (supertest)', () => {
  let app: INestApplication;
  let handlers: Handlers;

  beforeAll(async () => {
    app = await createTestApp();
    handlers = new Handlers(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('createGoal', () => {
    it('should create and return a goal', async () => {
      const createGoalInput = {
        name: 'My Goal',
      };

      const res = await handlers.createGoal(createGoalInput);

      const { data } = res.body;

      expect(data.createGoal.id).toBeDefined();
      expect(data.createGoal.name).toBe(createGoalInput.name);
    });

    it('should create a subgoal', async () => {
      const createGoalInput = {
        name: 'My sub Goal',
        parent: '1',
      };

      const res = await handlers.createGoal(createGoalInput);

      const { data } = res.body;
      expect(data.createGoal.id).toBeDefined();
      expect(data.createGoal.name).toBe(createGoalInput.name);
      expect(data.createGoal.parent.name).toBe('My Goal');
    });
  });

  describe('find', () => {
    it('should have child goals', async () => {
      const res = await handlers.findGoal({ id: '1' });

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
      const res = await handlers.findAllGoals();

      const { data } = res.body;
      expect(data.goals).toBeDefined();
      expect(data.goals.length).toBe(2);
    });
  });

  describe('remove', () => {
    beforeEach(async () => {
      app = await createTestApp();
      handlers = new Handlers(app);
    });

    afterEach(async () => {
      await app.close();
    });

    it('should remove a goal that does not have children or a parent', async () => {
      // Create a goal
      const createGoalInput = {
        name: 'My sub Goal',
      };

      const createRes = await handlers.createGoal(createGoalInput);
      const { data: resData } = createRes.body;

      // Delete goal
      const res = await handlers.deleteGoal({ id: resData.createGoal.id });

      const { data: deletedData } = res.body;

      expect(deletedData.deleteGoal.id).toBeDefined();
      expect(deletedData.deleteGoal.id).toBe('1');

      // Fetch all goals
      const resGoals = await handlers.findAllGoals();

      const { data } = resGoals.body;
      expect(data.goals).toBeDefined();
      expect(data.goals.length).toBe(0);
    });

    it("should throw an error when trying to delete a goal that doesn't exist", async () => {
      // Delete goal
      const res = await handlers.deleteGoal({ id: '1' }).expect(200);

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
      await handlers.createGoal({
        name: 'My Goal',
      });

      // Create child goal
      await handlers.createGoal({
        name: 'My sub Goal',
        parent: '1',
      });

      // Delete goal
      const res = await handlers.deleteGoal({ id: '1' });

      const { errors } = res.body;
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe(
        'cannot delete goal with children, use FORCE or CASCADE to delete',
      );
    });

    it('removes parent and all children', async () => {
      // Create a goal
      await handlers.createGoal({
        name: 'My Goal',
      });

      // Create child goal
      await handlers.createGoal({
        name: 'My sub Goal',
        parent: '1',
      });

      // Delete goal
      const deleteGoalInput = { id: 1, deletionStrategy: 'RECURSIVE' };
      const res = await handlers.deleteGoal(deleteGoalInput);
      const { data } = res.body;
      expect(data).not.toBeNull();
      expect(data.deleteGoal.id).toBe('1');

      const childRes = await handlers.findGoal({ id: '2' });

      expect(childRes.body.data).toBeNull();
    });

    it('deleting child removes it from parent response', async () => {
      // Create a goal
      await handlers.createGoal({
        name: 'My Goal',
      });

      // Create child goal
      await handlers.createGoal({
        name: 'My sub Goal',
        parent: '1',
      });

      // Delete child goal
      const deleteGoalInput = { id: 2 };
      await handlers.deleteGoal(deleteGoalInput);

      const res = await handlers.findGoal({ id: '1' });

      const { data } = res.body;
      expect(data).not.toBeNull();
      expect(data.goal.children).toHaveLength(0);
    });

    it('can delete parent and orphan children', async () => {
      // Create a goal
      await handlers.createGoal({
        name: 'My Goal',
      });

      // Create child goal
      await handlers.createGoal({
        name: 'My sub Goal',
        parent: '1',
      });

      // Delete parent goal
      await handlers.deleteGoal({ id: 1, deletionStrategy: 'ORPHAN' });

      const res = await handlers.findGoal({ id: '2' });

      const { data } = res.body;
      expect(data).not.toBeNull();
      expect(data.goal.parent).toBeNull();
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
