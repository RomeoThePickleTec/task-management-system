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

    cy.wait(3000); // Espera explícita para asegurar que la página cargue completamente

    cy.get('#username', { timeout: 10000 }).should('be.visible').type(Cypress.env('USERNAME'));
    cy.get('#password', { timeout: 10000 }).should('be.visible').type(Cypress.env('PASSWORD'));
    cy.get('.bg-card').click();

    // Verifica que el menú esté visible antes de interactuar
    // Verifica que solo haya un elemento visible y haz clic
    cy.get('.inline-flex').click();
    cy.get('[href="/projects"] > .inline-flex > .ml-2').click();

    cy.wait(3500);
    cy.get('.flex > a > .inline-flex').click({ force: true });
    cy.get('#name', { timeout: 15000 }).should('be.visible').clear();
    cy.get('#name').type('Prueba_Proyecto');
    cy.get('#description').click();
    cy.get('#description').type('Prueba_Proyecto');
    cy.get('.grid > :nth-child(2) > .inline-flex').first().click();
    cy.get('.space-y-4 > :nth-child(4)').click();
    cy.get('.bg-primary', { timeout: 7500 }).click();
    cy.get('.mr-4 > .inline-flex').click();

    cy.wait(3500);
    cy.get('.file\\:text-foreground').should('exist').clear('P');
    cy.get('.file\\:text-foreground').should('exist').type('Prueba');

    // Espera que la barra de búsqueda esté visible y escribe "Prueba"
    cy.wait(3500);
    cy.get('.file\\:text-foreground')
      .should('exist')
      .clear()
      .type('Prueba');

    // Espera que el proyecto específico esté visible
    cy.contains('div[data-slot="card-title"].text-lg.font-medium', 'Prueba_Proyecto')
      .should('be.visible');

    // Selecciona el botón "Ver proyecto" asociado al proyecto "Prueba_Proyecto"
    cy.contains('div[data-slot="card-title"].text-lg.font-medium', 'Prueba_Proyecto')
      .parents('.flex') // Ajusta al contenedor principal del proyecto
      .find('button')
      .contains('Ver proyecto')
      .should('be.visible')
      .click();

      cy.wait(3500);
    //Miembro

    //sprints
    cy.get('.space-x-2 > .focus-visible\\:ring-ring\\/50', { timeout: 15000 })
    .should('be.visible')
    .click();

    cy.get('#name').should('exist').clear('Prueba_Proyecto_');
    cy.get('#name').should('exist').type('Proyecto_cambiado');
    cy.get('#description').click();
    cy.get('#description').type('Prueba_Proyecto_cambiado');
    cy.get(':nth-child(4) > .border-input').click();
    cy.get('.bg-primary').click();

    cy.wait(1500);
    // cy.get('.text-gray-500 > .inline-flex', { timeout: 15000 })
    // .should('be.visible')
    // .click();
    // // Asegúrate de que el botón de eliminar esté visible antes de hacer clic
    cy.get('.bg-destructive').should('exist').click();
    
    cy.get('.flex-col-reverse > .text-primary-foreground').should('exist').click();
  });
});
