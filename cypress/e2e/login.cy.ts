describe('Basic test for login', () => {
  it('passes', () => {
    cy.visit(Cypress.config('baseUrl'));

    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').clear('d');
    cy.get('#username').type('djeison');
    cy.get('#password').clear('H');
    cy.get('#password').type('Hello123');
    cy.get('.bg-card').click();
    cy.get('.inline-flex').click();
    cy.get('.space-y-1 > [href="/projects"] > .inline-flex').click();
    cy.get('[href="/tasks"] > .inline-flex > .ml-2').click();
    cy.get('[href="/sprints"] > .inline-flex > .ml-2').click();
    cy.get('[href="/users"] > .inline-flex > .ml-2').click();
    cy.get('[href="/reports"] > .inline-flex > .ml-2').click();
    /* ==== End Cypress Studio ==== */

  })
  //for negative test
  it('fails', () => {
    cy.visit(Cypress.config('baseUrl'));
    /* ==== Generated with Cypress Studio ==== */

    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('#username').clear('d');
    cy.get('#username').type('dadawdfwa');
    cy.get('#password').clear('faw');
    cy.get('#password').type('fawfawfaw');
    cy.get('.inline-flex').click();
    /* ==== End Cypress Studio ==== */
  })
  
})