describe('Post Module', ()=>{
    
    const dataCount = 1 //Banyak data 15
    before('Login', ()=>{
        cy.login();
    })

    before('generate user Data', ()=> cy.generateUserData(dataCount))

    describe('Create Post', ()=>{
        /*
        1. Return unauthorized
        2. Return error validation message
        3. Return coorect post 
        */
       it('Should return unauthorized', ()=>{
            // cy.request({
            //     method: 'POST',
            //     url: '/posts',
            //     failOnStatusCode:false,
            // }).then((response)=>{
            //     cy.unauthorized(response)
            // })
            cy.checkUnauthorized('POST', '/posts')
       })

       it('Should return error validation messages', ()=>{
            cy.request({
                method: 'POST',
                url: '/posts',
                headers: {                  // Kalau tidak menggunakan ini maka akan mereturn 401 (unauthorized/tidak login)
                    authorization: `Bearer ${Cypress.env('token')}`,
                  },
                failOnStatusCode: false,
            }).then((response)=>{
                cy.badRequest(response, [
                    "title must be a string",
                    "content must be a string"])
            })
       })

       it('Should return correct post', ()=>{
        cy.fixture('posts').then((postData)=>{
            cy.request({
                method: 'POST',
                url: '/posts',
                headers: {
                    authorization: `Bearer ${Cypress.env('token')}`,
                  },
                body: {
                    title: postData[0].title,
                    content: postData[0].content
                },
            }).then((response)=>{
                cy.create(response)
                const{data : {title, content, comments, created_at} } = response.body
                expect(content).to.eq(postData[0].content)
                expect(title).to.eq(postData[0].title)
                expect(comments.length).to.eq(0)
                expect(created_at).not.to.be.undefined
            })
        })
       })
    })

    describe('Get all Post', () =>{
        before('do login', ()=>{ //Dijalankan lebih dahulu sebelum menjalankan bawahnya
            cy.login()
        })
        /*
        1. Error Unauthorized
        2. Return correct current data
        */
        it('Should return unauthorized when send no token',()=>{
            //  cy.request({
            //     method: 'GET',
            //     url: '/posts',
            //     failOnStatusCode:false,
            // }).then((response)=>{
            //     cy.unauthorized(response)
            // })
            cy.checkUnauthorized('GET', '/posts')
        })

        it('Should return correct current data', ()=>{
            cy.request({
                method: 'GET',
                url: '/posts',
                headers: {
                  authorization: `Bearer ${Cypress.env('token')}`,
                },
                failOnStatusCode: false,
              }).then((response) => {
                expect(response.body.message).to.eq("Get all posts")
                expect(response.body.success).to.be.true
              })
            })
        })
})