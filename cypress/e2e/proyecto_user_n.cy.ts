// Nuevo archivo de prueba de login con variables de entorno cifradas
describe('Basic test for login', () => {
  before(() => {
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');

    if (!username || !password) {
      throw new Error("❌ No se encontraron las variables de entorno cifradas. Verifica el archivo cypress.env.enc y la clave de descifrado.");
    }
  });

  it('passes', () => {
    cy.visit(Cypress.config('baseUrl'));

    cy.get('#username').clear().type(Cypress.env('USERNAME'));
    cy.get('#password').clear().type(Cypress.env('PASSWORD'));
    cy.get('.bg-card').click();

    // Verificar navegación
    cy.get('.inline-flex').click();
    cy.get('.space-y-1 > [href="/projects"] > .inline-flex').click();
    cy.get('[href="/tasks"] > .inline-flex > .ml-2').click();
    cy.get('[href="/sprints"] > .inline-flex > .ml-2').click();
    cy.get('[href="/users"] > .inline-flex > .ml-2').click();
    cy.get('[href="/reports"] > .inline-flex > .ml-2').click();
  });

  it('fails', () => {
    cy.visit(Cypress.config('baseUrl'));

    cy.get('#username').clear().type('incorrect_user');
    cy.get('#password').clear().type('incorrect_password');
    cy.get('.inline-flex').click();

  });
});
