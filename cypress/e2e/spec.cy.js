/// <reference types="cypress" />

describe('API Testing with Cypress', () => {
  let newUserId;  // Variable to store the newly created user ID
  let userIdToUpdate; // Variable to store the user ID to update

  // Test case for fetching multiple users
  it('GET - Multiple Users', () => {
    cy.request('GET', '/users?page=2')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('page', 2);
        expect(response.body.data).to.have.length(6);

        response.body.data.forEach((item) => {
          expect(item).to.have.property('id');
          expect(item).to.have.property('email');
          expect(item).to.have.property('first_name');
          expect(item).to.have.property('last_name');
        });
      });
  });

  // Test case for fetching a single user with ID of 2
  it('GET - Single User', () => {
    cy.request('GET', '/users/2')
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data).to.have.property('id', 2);
        expect(response.body.data).to.have.property('email');
        expect(response.body.data).to.have.property('first_name');
        expect(response.body.data).to.have.property('last_name');
      });
  });

  // Test case for a user not found using a random 4-digit ID
  it('GET - Single User Not Found', () => {
    const randomUserId = Math.floor(1000 + Math.random() * 9000);

    cy.request({
      method: 'GET',
      url: `/users/${randomUserId}`,
      failOnStatusCode: false
    })
    .then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  // Test case to add a new user
  it('POST - Add New User', () => {
    cy.fixture('createUser.json').then((requestBody) => {
      cy.request({
        method: 'POST',
        url: '/users',
        body: requestBody
      })
      .then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('name', requestBody.name);
        expect(response.body).to.have.property('job', requestBody.job);

        newUserId = response.body.id;
        cy.log(`New User ID is: ${newUserId}`);
      });
    });
  });

  // Test case to get all users and pick one for updating
  it('GET - All Users to Pick One for Update', () => {
    cy.request('GET', '/users?page=1')
      .then((response) => {
        expect(response.status).to.eq(200);

        if (response.body.data.length > 0) {
          userIdToUpdate = response.body.data[0].id;
          cy.log(`User ID to Update: ${userIdToUpdate}`);
        } else {
          throw new Error('No users available to update');
        }
      });
  });

  // Test case to update a user
  it('PUT - Update User', () => {
    if (userIdToUpdate) {
      cy.fixture('updateUser.json').then((requestBody) => {
        // Generate random strings for name and job
        requestBody.name = `Name_${Math.random().toString(36).substring(2, 8)}`;
        requestBody.job = `Job_${Math.random().toString(36).substring(2, 8)}`;

        cy.request({
          method: 'PUT',
          url: `/users/${userIdToUpdate}`,
          body: requestBody
        })
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('name', requestBody.name);
          expect(response.body).to.have.property('job', requestBody.job);
        });
      });
    } else {
      throw new Error('User ID to update is not available');
    }
  });
});
