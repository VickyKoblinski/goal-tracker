describe('register a new user', () => {
  const uuid = new Date().getTime();
  const cypressUser = `cypress-user-${uuid}`;

  it('Creates user', () => {
    cy.visit('/register');
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
        (email: any) => email.personalizations[0].to[0].email === `${cypressUser}@gmail.com`
      );
      const { dynamic_template_data } = email.personalizations[0];

      const { verificationToken } = dynamic_template_data;

      cy.visit(`/verify?token=${verificationToken}`);

      cy.findByText(`Page One`);
    });
  });

  it('Logs in user', () => {
    cy.visit('/login');
    cy.findByLabelText(/email address/i)
      .clear()
      .type(`${cypressUser}@gmail.com`);

    cy.findByLabelText(/password/i)
      .clear()
      .type(`cypress-user`);

    const submit = cy.findByRole('button', { name: /login/i });
    submit.click();

    cy.findAllByText(/Page One/i);
  });
});
