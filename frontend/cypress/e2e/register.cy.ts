describe("register a new user", () => {
  const uuid = new Date().getTime();
  const cypressUser = `cypress-user-${uuid}`;

  it("Creates user", () => {
    cy.visit("/register");
    const username = cy.findByLabelText(/username/i);
    username.type(cypressUser);

    const password = cy.findByLabelText(/password/i);
    password.type(`cypress-user`);

    const email = cy.findByLabelText(/email/i);
    email.type(`${cypressUser}@gmail.com`);

    const submit = cy.findByRole("button", { name: /submit/i });
    submit.click();

    cy.findByText("Verify your email");

    cy.request("http://localhost:7007/api/mails").then((response) => {
      const email = response.body.find(
        (email: any) =>
          email.personalizations[0].to[0].email === `${cypressUser}@gmail.com`
      );
      const { dynamic_template_data } = email.personalizations[0];

      const { verificationToken } = dynamic_template_data;

      cy.visit(`/verify?token=${verificationToken}`);

      const goToDashboard = cy.findByRole("button", {
        name: /go to dashboard/i,
      });
      goToDashboard.click();

      cy.findByText(`Hello ${cypressUser}`);
    });
  });
});
