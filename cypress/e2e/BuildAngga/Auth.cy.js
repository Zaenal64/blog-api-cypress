describe('Auth module', ()=> {
    const dataCount = 1

    before('generate user data', ()=>cy.generateUserData(dataCount))
    
    describe('Register',()=>{
        /*
        1. Error validation (null, name, email and password)
        2. Error invalid email format
        3. Error invalid password format
        4. Registered successfully
        5. Error duplicate entry
        */
        it('Should return error message for validation', () =>{
            // expect(true).to.be.true
            // expect(false).not.be.true
            // expect(1+3).to.eq(34)
            cy.request({
                method: 'POST',
                url: '/auth/register',
                failOnStatusCode:false,
            }).then((response)=>{
                // expect(response.status).to.eq(400)
                // expect(response.body.error).to.eq("Bad Request")
                // expect("name should not be empty").to.be.oneOf(response.body.message)
                // expect("email should not be empty").to.be.oneOf(response.body.message)
                // expect("password should not be empty").to.be.oneOf(response.body.message)
                cy.badRequest(response, [
                    "name should not be empty",
                    "email should not be empty",
                    "password should not be empty"
                ])
            })
        })
        it('Should return error message for invalid email format', () =>{
            cy.fixture('users').then((userData)=>{
                cy.request({
                    method: 'POST',
                    url: '/auth/register',
                    body:{
                        "name": userData[0].name,
                        "email": "john%nest.test",
                        "password": userData[0].password
                    },
                    failOnStatusCode:false,
                }).then((response)=>{
                    cy.badRequest(response, [
                        "email must be an email"
                    ])
                })
            })
         })

         it('Should return error message for invalid password format', () =>{
            cy.fixture('users').then((userData)=>{
                cy.request({
                    method: 'POST',
                    url: '/auth/register',
                    body:{
                        "name": userData[0].name,
                        "email": userData[0].email,
                        "password": "InvalidPassword"
                    },
                    failOnStatusCode:false,
                }).then((response)=>{
                    cy.badRequest(response, [
                        "password is not strong enough"
                    ])
                })
        })
         })

         it('Should registered successfully',()=>{
            cy.fixture('users').then((userData)=>{
                cy.request({
                    method: 'POST',
                    url: '/auth/register',
                    body:{
                        name: userData[0].name,
                        email: userData[0].email,
                        password: userData[0].password
                    },
                }).then((response)=>{
                    cy.create(response)
                    const {id,name,email,password} = response.body.data
                    expect(id).not.to.be.undefined
                    expect(name).to.eq(userData[0].name)
                    expect(email).to.eq(userData[0].email)
                    expect(password).to.be.undefined
                })
            })
            
         })

         it('Should return error because of duplicate email', () =>{
            const userData = {
                "name": "John Doe",
                "email": "john@nest.test",
                "password": "Secret_123"
            }
                cy.request({
                    method: 'POST',
                    url: '/auth/register',
                    body:userData,
                    failOnStatusCode:false,
                }).then((response)=>{
                    expect(response.status).to.eq(500)
                    expect(response.body.message).to.eq("Email already exists")
                    expect(response.body.success).to.be.false
                    
                })
        })
    })
    
    describe('Login',()=>{
        /*
        1. Unauthorized on failed
        2. Return acess token on success
        */
        
       it('Should return unauthorized on failed', () =>{
            cy.request({  //Tidak mengirim body
                method: 'POST',
                url: '/auth/login',
                failOnStatusCode:false
            }).then((response)=>{
                cy.unauthorized(response)
            })
            cy.fixture('users').then((userData)=>{
                cy.request({ //Mengirim body tetapi salah
                    method: 'POST',
                    url: '/auth/login',
                body: {
                    email: userData[0].email,
                    password: 'invalidPassword'
                },
                failOnStatusCode: false,
                }).then((response)=>{
                    cy.unauthorized(response)
                })
        })
       })

       it('Should return acess token on success', () =>{
        cy.fixture('users').then((userData)=>{
                cy.request({
                    method: 'POST',
                    url: '/auth/login',
                body: {
                    email: userData[0].email,
                    password: userData[0].password
            },
                }).then((response)=>{
                    cy.create(response)
                    expect(response.body.message).to.eq("Login success")
                    expect(response.body.data.access_token).not.to.be.undefined
                })
            })
        })
    })
    
    describe('Me',()=>{
        /*
        1. Error Unauthorized
        2. Return correct current data
        */
        before('do login',()=>{
        
            //Dijalankan lebih dahulu sebelum menjalankan bawahnya
        cy.login()
        })

        it('Should return unauthorized when send no token', ()=> {
            cy.checkUnauthorized('GET', '/auth/me')
        })
        
        it('should return correct current data', () => {
            
            cy.request({
              method: 'GET',
              url: '/auth/me',
              headers: {
                authorization: `Bearer ${Cypress.env('token')}`,
              },
              failOnStatusCode: false,
            }).then((response) => {
                const{data : {id, name, email, password} } = response.body
                expect(response.status).to.eq(200)
                expect(response.body.success).to.be.true
                expect(id).not.to.be.undefined
                expect(name).to.eq("John Doe")
                expect(email).to.eq("john@nest.test")
                expect(password).to.be.undefined
            })
        })
    })
})