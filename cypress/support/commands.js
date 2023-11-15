// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Cypress.Commands.add('createUsers',()=>{
//     cy.request('POST', 'http://localhost:3000/auth/register')
// })

Cypress.Commands.add('resetUsers',()=>{
    cy.request('DELETE', '/auth/reset')
})

Cypress.Commands.add('badRequest', (response, message = []) =>{
    expect(response.status).to.eq(400)
    expect(response.body.error).to.eq('Bad Request')
    message.forEach((message)=>{
        expect(message).to.be.oneOf(response.body.message)
    })
})

Cypress.Commands.add('unauthorized', (response) =>{
    expect(response.status).to.eq(401)
    expect(response.body.message).to.eq('Unauthorized')
})

Cypress.Commands.add('create',(response)=>{
    expect(response.status).to.eq(201)
    expect(response.body.success).to.be.true
})

Cypress.Commands.add('checkUnauthorized',(method, url) =>{
    cy.request({
        method,
        url,
        Headers:{
            authorization: null,
        },
        failOnStatusCode: false,
    }).then((response) => {
        cy.unauthorized(response)
    })
})

Cypress.Commands.add('login', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@nest.test',
      password: 'Secret_123',
    }
    cy.resetUsers()
  
    cy.request({
      method: 'POST',
      url: '/auth/register',
      body: userData,
    })
  
    cy.request({
      method: 'POST',
      url: '/auth/login',
      body: {
        email: userData.email,
        password: userData.password,
      },
    }).then((response) => {
      Cypress.env('token', response.body.data.access_token)
    })
  })



Cypress.Commands.add('loginNewAccount',()=>{
      cy.fixture('users').then((userData)=>{
        cy.request({
            method: 'POST',
            url: '/auth/register',
            body:{
                name: userData[0].name,
                email: userData[0].email,
                password: userData[0].password
            },
      })
        cy.request({
            method: 'POST',
            url: '/auth/login',
            body: {
                email: userData[0].email,
                password: userData[0].password,
            },
        }).then((response) => {
            Cypress.env('token', response.body.data.access_token) //env untuk menyimpan data, untuk digunakan di file lain
        })
    })
})

Cypress.Commands.add('generatePostsData', (count)=>{
    const{faker} = require('@faker-js/faker')
                                                                    /*Method untuk menjadikan suatu data menjadi file 
                                                                        ._. = lodash (Akan mengulangi suatu comment/logic sesuai yang kita inginkan) 
                                                                    */  
    cy.writeFile('cypress/fixtures/posts.json', Cypress._.times(count, ()=>{
        return{
            title: faker.lorem.words(3), //Sebanyak 3 kata
            content: faker.lorem.paragraph(),
        }
    }))       
})

Cypress.Commands.add('generateUserData', (count)=>{
    const{faker} = require('@faker-js/faker')
    cy.writeFile('cypress/fixtures/users.json', Cypress._.times(count, ()=>{
        return{
            name: faker.name.firstName(),
            email: faker.internet.email(),
            password: faker.string.sample()
        }
    }))
})

Cypress.Commands.add('createPosts', (data = []) => {
    cy.loginNewAccount()

    // RESET POST
    cy.request({
        method: 'DELETE',
        url: '/posts/reset',
        headers: {
            authorization: `Bearer ${Cypress.env('token')}`
        }
    })

    // CREATE POSTS
    data.forEach((_posts) => {
        cy.request({
            method: 'POST',
            url: '/posts',
            headers:{
                authorization: `Bearer ${Cypress.env('token')}`
            },
            body: _posts,
                // title: _posts.title,
                // content: _posts.content
        })
    });
})

Cypress.Commands.add('generateCommentsData', (count)=>{
    const {faker} = require('@faker-js/faker')

    cy.request({
        method: 'DELETE',
        url: '/comments/reset',
        headers: {
            authorization: `Bearer ${Cypress.env('token')}`
        }
    })

    cy.generatePostsData(3) //membuat sampai max id 5 secara acak
    cy.fixture('posts').then(posts => cy.createPosts(posts))

    cy.writeFile('cypress/fixtures/comments.json',
    Cypress._.times(count, ()=>{
        return{
            post_id: faker.datatype.number({min: 1, max: 3 }),
            content: faker.lorem.words(5) // terdiri dari 5 kata
        }
    }))
})