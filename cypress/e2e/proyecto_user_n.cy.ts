describe('Pryecto CRUD normal User', () => {
  it('passes', () => {
    cy.visit(Cypress.config('baseUrl'));

    // Usando las variables de entorno descifradas
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');

    if (!username || !password) {
      throw new Error("❌ No se encontraron las variables de entorno cifradas. Verifica el archivo cypress.env.enc y la clave de descifrado.");
    }

    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').clear();
    cy.get('#username').type(username);  // Usando la variable de entorno cifrada
    cy.get('#password').clear();
    cy.get('#password').type(password);  // Usando la variable de entorno cifrada
    cy.get('.bg-card').click();
    cy.get('.inline-flex').click();
    cy.get('.space-y-1 > [href="/projects"] > .inline-flex').click();
    /* ==== End Cypress Studio ==== */
  });

});
