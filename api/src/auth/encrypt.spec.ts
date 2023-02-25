import * as encrypt from './encrypt';

describe('encrypt', () => {
  it('should hash a password and verify hash matches plain text password', async () => {
    const password = 'my-random-password';
    const hash = await encrypt.hashPassword(password);
    expect(password).not.toEqual(hash);
    const matches = await encrypt.comparePassword(password, hash);
    expect(matches).toBeTruthy();
  });
});
