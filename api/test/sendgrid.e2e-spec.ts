import sendgridHandler from './sendgrid.handler';

describe('Sendgrid mock container', () => {
  beforeEach(async () => {
    await sendgridHandler.delete();
  });

  it('connects to sendgrid-mock docker container', async () => {
    const res = await sendgridHandler.get();
    expect(res.body.length).toBe(0);
  });
});
