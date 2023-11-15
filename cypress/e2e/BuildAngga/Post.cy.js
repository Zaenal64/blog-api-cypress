describe('Post Module', ()=>{
    const randomIdFalse = Cypress._.random(16, 90) //Random angka dimulai dari 16 - 70
    const randomIdTrue = Cypress._.random(1, 15)
    const dataCount = 1 //Banyak data 15
    before('Login', ()=>{
        cy.login();
    })

    before('generate user Data', ()=> cy.generateUserData(dataCount))

    describe('Create Post', ()=>{

        /*
        1. Return unauthorized
        2. Return error validation message
        3. Return correct post 
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

    describe('Get all Posts', () =>{
        before('do login', ()=>{ //Dijalankan lebih dahulu sebelum menjalankan bawahnya
            cy.login()
        })
        /*
        1. Error Unauthorized
        2. Return Correct count and data
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
            cy.fixture('posts').then((postData)=>{
                
               cy.createPosts(postData)

                // GET ALL POSTS
                cy.request({
                    method: 'GET',
                    url: '/posts',
                    headers: {
                      authorization: `Bearer ${Cypress.env('token')}`,
                    },
                  }).then((response) => {
                    expect(response.status).to.eq(200)
                    expect(response.body.success).to.true
                    expect(response.body.data.length).to.eq(postData.length)

                    postData.forEach((_posts,index) => {
                       expect(response.body.data[index].id).to.eq(index+1)
                       expect(response.body.data[index].title).to.eq(_posts.title)
                       expect(response.body.data[index].content).to.eq(_posts.content)
                    })
                  })
                })
            })
        })

    describe('Get data by Id', ()=>{
        /*
        1. Error Unauthorized
        2. Return correct data
        3. Return not found
        */
        it('Should return unauthorized',()=>{
            cy.checkUnauthorized('GET', '/posts/2')
        })
            
        it('Should return correct data', () => {
            cy.fixture('posts').then((postData) => {
                postData.forEach((_posts, index) => { // Menggunakan for each karena ingin mengecek semua data format sama  secara berurutan
                    cy.request({
                        method: 'GET',
                        url: `/posts/${index + 1}`, // untuk mengunjungi tiap halaman pada posts
                        headers: { 
                            authorization: `Bearer ${Cypress.env('token')}` },
                    }).then((response)=>{
                        const { title, content } = response.body.data
                        expect(response.status).to.be.ok
                        expect(title).to.eq(_posts.title)
                        expect(content).to.eq(_posts.content)
                    })
                });
            });
        })

        it('Should return not found', () => {
                    cy.request({
                        method: 'GET',
                        url: `/posts/${randomIdFalse}`, 
                        headers: { 
                            authorization: `Bearer ${Cypress.env('token')}` },
                        failOnStatusCode: false
                    }).then((response)=>{
                        expect(response.status).to.eq(404),
                        expect(response.body.success).to.be.false,
                        expect(response.body.data).to.be.null
            });
        })
    })

    describe('Update post', ()=>{
        /*
            1. Return Unauthorized
            2. Return Not Found
            3. Return Error Validation Message
            4. Return Correct Update Posts
        */
        it("Should return unauthorized", ()=>{
            cy.checkUnauthorized('PATCH', '/posts/2001')
        }) 

        it("Should return not found", ()=>{
            cy.request({
                method: 'PATCH',
                url: `/posts/${randomIdFalse}`,
                headers:{
                    authorization: `Bearer ${Cypress.env('token')}`
                },failOnStatusCode:false
            }).then((response)=>{
                expect(response.status).to.eq(404),
                expect(response.body.success).to.be.false,
                expect(response.body.data).to.be.null
            })
        })

        it('Should return error validation messages', ()=>{
            cy.request({
                method: 'PATCH',
                url: `/posts/${randomIdTrue}`,
                headers:{
                    authorization: `Bearer ${Cypress.env('token')}`
                },failOnStatusCode:false,
                body: {
                    title: false,
                    content: randomIdFalse
                }
            }).then((response)=>{
               cy.badRequest(response, [
                "title must be a string",
                "content must be a string"
               ])
            })
        })

        it('Should return correct updated post',()=>{
            const updatedPost = {
                id: 1,
                title: 'Updated title',
                content: 'Updated content'
            }

            // Update Post
            cy.request({
                method: 'PATCH',
                url: `/posts/${updatedPost.id}`,
                headers:{
                    authorization: `Bearer ${Cypress.env('token')}`
                },
                body: {
                    title: updatedPost.title,
                    content: updatedPost.content
                }
            }).then((response)=>{
                const { success, 
                    data: { title, content },
                } = response.body
                
                expect(response.status).to.eq(200),
                expect(success).to.be.true
                expect(title).to.eq(updatedPost.title)
                expect(content).to.eq(updatedPost.content)
            })

            // Check get by id
            cy.request({
                method: 'GET',
                url: `/posts/${updatedPost.id}`, 
                headers: { 
                    authorization: `Bearer ${Cypress.env('token')}` },
            }).then((response)=>{
                const {  title, content } = response.body.data
                expect(response.status).to.be.ok
                expect(title).to.eq(updatedPost.title)
                expect(content).to.eq(updatedPost.content)
            });

            // Check get all post
            cy.request({
                method: 'GET',
                url: '/posts',
                headers: {
                  authorization: `Bearer ${Cypress.env('token')}`,
                },
              }).then((response) => {
                const post = response.body.data.find(
                    (_posts) => _posts.id === updatedPost.id) // Filter search manual dengan id = 1
                
                expect(post.title).to.eq(updatedPost.title)
                expect(post.content).to.eq(updatedPost.content)
            })
        })
    })

    describe('Delete post', ()=>{
        /*
            1. Return unatuhorized
            2. Return Not Found
            3. Successfully remove the post
            4. Not be Found the Delte Post
        */

    it('Should return unauthorized', ()=>{
        cy.checkUnauthorized('GET', '/posts/2')
    })

    it('Should return not found', ()=>{
        cy.request({
            method: 'DELETE',
            url: `/posts/${randomIdFalse}`,
            headers:{
                authorization: `Bearer ${Cypress.env('token')}`
            },failOnStatusCode:false
        }).then((response)=>{
            expect(response.status).to.eq(404),
            expect(response.body.success).to.be.false,
            expect(response.body.data).to.be.null
        })
    })

    it('Should successfully remove the post', ()=>{
        cy.request({
            method: 'DELETE',
            url: `/posts/1`,
            headers:{
                authorization: `Bearer ${Cypress.env('token')}`}
        }).then((response)=>{
            expect(response.status).to.be.ok
            expect(response.body.success).to.be.true
            expect(response.body.message).to.eq('Post deleted successfully')
        })
    })
    
    it('Should not be Found the Deleted Post',()=>{
           // Check get by id
           cy.request({
            method: 'GET',
            url: `/posts/1`, 
            headers: { 
                authorization: `Bearer ${Cypress.env('token')}`
            },failOnStatusCode:false
        }).then((response)=>{
            expect(response.status).to.eq(404)
            expect(response.body.success).to.be.false,
            expect(response.body.data).to.be.null
        });

        // Check get all post
        cy.request({
            method: 'GET',
            url: '/posts',
            headers: {
              authorization: `Bearer ${Cypress.env('token')}`,
            },
          }).then((response) => {
            const post = response.body.data.find(
                (_posts) => _posts.id === 1) // Filter search manual dengan id = 1
            expect(post).to.be.undefined
        })         
    })

    })
})