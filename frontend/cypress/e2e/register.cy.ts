describe('register a new user', () => {
  const uuid = new Date().getTime();
  const cypressUser = `cypress-user-${uuid}`;

  it('Creates user', () => {
    cy.visit('/auth/register');
    const username = cy.findByLabelText(/username/i);
    username.type(cypressUser);

    const email = cy.findByLabelText(/email/i);
    email.type(`${cypressUser}@gmail.com`);

    const password = cy.findByLabelText(/password/i);
    password.type(`cypress-user`);

    const submit = cy.findByRole('button', { name: /create account/i });
    submit.click();

    cy.findByText(`Please check your email!`);

    cy.request('http://localhost:7007/api/mails').then((response) => {
      const email = response.body.find(
        (email: any) =>
          email.personalizations[0].to[0].email === `${cypressUser}@gmail.com` &&
          email.template_id === 'd-verifyEmail'
      );
      const { dynamic_template_data } = email.personalizations[0];

      const { verificationToken } = dynamic_template_data;

      cy.visit(`/auth/verify?token=${verificationToken}`);

      cy.findByText(`Page One`);
    });
  });

  it('can log in and log out', () => {
    // logs in
    cy.visit('/auth/login');
    cy.findByLabelText(/email address/i)
      .clear()
      .type(`${cypressUser}@gmail.com`);

    cy.findByLabelText(/password/i)
      .clear()
      .type(`cypress-user`);

    const submit = cy.findByRole('button', { name: /login/i });
    submit.click();

    cy.findAllByText(/Page One/i);

    // Stays logged in after refresh
    cy.reload();
    cy.findAllByText(/Page One/i);

    // Logs out
    cy.findByLabelText('Account Menu').click();
    cy.findByText('Logout').click();
    cy.findByText('Sign in to Achieve.guru');

    // Stays logged out and cannot go to dashboard
    cy.visit('/dashboard');
    cy.findByText('Sign in to Achieve.guru');
  });

  it('resets password', () => {
    cy.visit('/auth/reset-password/');
    cy.findByLabelText(/email address/i)
      .clear()
      .type(`${cypressUser}@gmail.com`);
    cy.findByRole('button', { name: /send request/i }).click();

    cy.request('http://localhost:7007/api/mails').then((response) => {
      const recoveryEmail = response.body.find(
        (email: any) =>
          email.personalizations[0].to[0].email === `${cypressUser}@gmail.com` &&
          email.template_id === 'd-resetPassword'
      );
      const { dynamic_template_data } = recoveryEmail.personalizations[0];
      const { verificationToken, email } = dynamic_template_data;

      cy.visit(`/auth/new-password?token=${verificationToken}&email=${email}`);
      cy.findByLabelText(/email/i).should('have.value', email);
      cy.findByLabelText('Password').type('pw-cypress-user');
      cy.findByLabelText(/confirm new password/i).type('pw-cypress-user');
      cy.findByRole('button', { name: /update password/i }).click();
      cy.findByText(/Change password success!/i);
    });
  });

  it('cannot login with original password', () => {
    cy.visit('/auth/login');
    cy.findByLabelText(/email address/i)
      .clear()
      .type(`${cypressUser}@gmail.com`);
    cy.findByLabelText(/password/i)
      .clear()
      .type(`cypress-user`);
    cy.findByRole('button', { name: /login/i }).click();

    cy.findByText('Unauthorized');
  });

  it('can login with new password', () => {
    cy.visit('/auth/login');
    cy.findByLabelText(/email address/i)
      .clear()
      .type(`${cypressUser}@gmail.com`);
    cy.findByLabelText(/password/i)
      .clear()
      .type(`pw-cypress-user`);
    cy.findByRole('button', { name: /login/i }).click();

    cy.findByText('Page One');
  });
});
