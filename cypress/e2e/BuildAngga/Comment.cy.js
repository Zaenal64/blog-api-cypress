describe('Comment Module', ()=>{

    const deletedId = Cypress._.random(1, 5)

    before('Login', ()=>{
        cy.login();
    })

    describe('Create Comment', ()=>{

        /*
            1. Return Unauthorized
            2. Return error validation
            3. Return correct comments
            4. Found in get post by id endpoint
            5. Found in all posts endpoint
        */

        it('Should return Unauthorized', ()=>{
            cy.checkUnauthorized('POST', '/comments')
        })

        it('Should return error validation messages', ()=>{
            cy.request({
                method: 'POST',
                url: '/comments',
                headers: {
                    authorization: `Bearer ${Cypress.env('token')}`,
                },failOnStatusCode:false
            }).then((response)=>{
                cy.badRequest(response, [
                    "post_id should not be empty",
                    "post_id must be a number conforming to the specified constraints",
                    "content should not be empty",
                    "content must be a string"
                ])
            })
        })

        it('Should return correct comments', ()=>{
            cy.generateCommentsData(5) //buat 5 data dummy

            cy.fixture('comments').then((CommentsData)=>{
                CommentsData.forEach((_Comment) => {
                    cy.request({
                        method: 'POST',
                        url: '/comments',
                        headers: {
                            authorization: `Bearer ${Cypress.env('token')}`,
                        },
                        body: _Comment,
                        /*
                        {
                            // post_id: _Comment.post_id,
                            // content: _Comment.content
                        }
                        */
                    }).then((response) =>{
                        const {success, data: {post_id, content},} = response.body

                        expect(response.status).to.eq(201),
                        expect(success).to.be.true,
                        expect(post_id).to.eq(_Comment.post_id)
                        expect(content).to.eq(_Comment.content)
                    })
                });
            })
        })

        it('Should be found in get post by id endpoint', ()=>{
            cy.fixture('comments').then((commentData) =>{
                cy.request({
                    method: 'GET',
                    url: `/posts/${commentData[0].post_id}`, // Mengambil sample data pertama, latihan menggunakan foreach untuk semua data
                    headers: {
                        authorization: `Bearer ${Cypress.env('token')}`
                    },
                }).then((response)=>{
                    const{comments} = response.body.data
                    const isFound = comments.some(
                        (comment) => comment.content === commentData[0].content
                    )
                    expect(comments).to.be.ok
                    expect(isFound).to.be.true 
                })
            })
        })

        it('Should be found in get all posts end point', () =>{
            cy.request({
                method: 'GET',
                url: '/posts',
                headers: {
                    authorization: `Bearer ${Cypress.env('token')}`,
                }
            }).then((response) =>{
                cy.fixture('comments').then((commentData) =>{
                    const posts = response.body.data
                    commentData.forEach((comment)=>{
                        const isFound = posts
                        .find((post) => post.id === comment.post_id)
                        .comments.some((_comment) => _comment.content === comment.content)

                        expect(isFound).to.be.true
                    })
                })
            })
        })

    })

    describe('Delete Comment',()=>{
        /*
            1. Return Unauthorized
            2. Return not Found
            3. Successfully Deleted
            4. Not Found in Detail Post Endpoint
        */

       it('Should retrn unauthoried', ()=>{
        cy.checkUnauthorized('DELETE', '/comments/5')
       }) 

       it('Should return not found', ()=>{
        cy.request({
            method: 'DELETE',
            url: `/comments/${Cypress._.random(6, 10)}`, // Mencari data yang tidak ada 
            headers: {
                authorization: `Bearer ${Cypress.env('token')}`,
            },failOnStatusCode: false,
        }).then((response) =>{
            expect(response.status).to.eq(404)
        })
       })

       it('Should successfully delete comment',()=>{
        cy.request({
            method: 'DELETE',
            url: `/comments/${deletedId}`, //Mencari data yang ada
            headers: {
                authorization: `Bearer ${Cypress.env('token')}`,
            },
        }).then((response) =>{
            const {message, success} = response.body
           
            expect(response.status).to.eq(200)
            expect(message).to.eq('Comment deleted successfully')
            expect(success).to.be.true 

        })
       })

       it('Should not be found in detail post endpoint',()=>{
            cy.fixture('comments').then((commentData)=>{
                const deletedComment = commentData[deletedId - 1] // Karna diawali dengan 0

            cy.request({
                method: 'GET',
                url: `/posts/${deletedComment.post_id}`,
                headers: {
                    authorization: `Bearer ${Cypress.env('token')}`
                },          
            }).then(response =>{
               const {comments} = response.body.data
               const isFound = comments.some((comment)=>
               comment.id === deletedId &&
               comment.content === deletedComment.content)

               expect(isFound).to.be.false // Jika menemukan maka akan salah
            })

            })
       })

    })
})