describe('Login', () => {
    beforeEach(() => {
        cy.visit('/account/login');

        // getting the elements
        cy.get('input[data-testid=username]').as('usernameInput');
        cy.get('input[type=password]').as('passwordInput');
        cy.findByRole('button').as('submitButton');
    });

    it('login fails', () => {
        cy.get('@submitButton').should('be.visible').should('be.disabled');
        cy.findByTestId('error-message').should('not.exist');

        // input wrong credentials
        cy.get('@usernameInput')
            .should('be.visible')
            .should('be.empty')
            .type('abc@abc.com');
        cy.get('@submitButton').should('be.disabled');

        cy.get('@passwordInput')
            .should('be.visible')
            .should('be.empty')
            .type('fdsfsdfs');
        cy.get('@submitButton').should('be.visible').should('be.enabled');

        cy.get('@submitButton').click();

        // error message should appear
        cy.findByTestId('error-message').should('be.visible');
    });

    it('can access library maps without logging in', () => {
        cy.visit('/#/view/library/upper-floor');
        cy.get('#library-upper-floor-svg').should('be.visible');

        cy.visit('#/view/library/ground-floor');
        cy.get('#library-ground-floor-svg').should('be.visible');
    });

    it('logs in successfully', () => {
        // execute login test only if the email and password is present in the environment file
        if (!Cypress.env('user').email || !Cypress.env('user').password) return;

        cy.get('@usernameInput').type(Cypress.env('user').email);
        cy.get('@passwordInput').type(Cypress.env('user').password);

        cy.get('@submitButton').click();

        // user successfully lands on the landing page
        cy.url().should('contain', '/dashboard');

        // access navigation header items
        cy.get('dui-schemes').should('be.visible');
        cy.get('dui-languages').should('be.visible');
        cy.get('dui-user').should('be.visible');

        // access library maps
        cy.visit('/#/view/library/upper-floor');
        cy.get('#library-upper-floor-svg').should('be.visible');

        cy.visit('#/view/library/ground-floor');
        cy.get('#library-ground-floor-svg').should('be.visible');

        // access map page
        cy.visit('/#/map');
        cy.get('#campus_map').should('be.visible');

        const buildings = [
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
            'h',
            'k',
            'l',
            'm',
            'n',
        ];
        for (const building of buildings) {
            cy.get('#building_' + building).should('be.visible');
        }

        // access graphs page
        cy.visit('/#/graphs');
        cy.get('apx-chart').should('have.length', 2);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let firstId = '';
        cy.get('.apexcharts-canvas')
            .first()
            .should('be.visible')
            .invoke('attr', 'id')
            .then((id) => {
                firstId = id ?? '';
            });

        cy.get('input[type=radio]').first().click();

        cy.get('.apexcharts-canvas')
            .first()
            .should('be.visible')
            .invoke('attr', 'id')

            .then((id) => {
                expect(id).to.not.eq(firstId);
            });

        // access administration page
        cy.visit('/#/administration');
        cy.get('dui-admin').should('be.visible');

        // access settings page
        cy.visit('/#/settings/general');
        cy.get('dui-schemes').should('be.visible');
        cy.get('dui-languages').should('be.visible');
    });
});
