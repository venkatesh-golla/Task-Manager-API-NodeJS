const request=require('supertest')
const app=require('../src/app')
const User=require('../src/models/user')
const {userOneId,userOne,setUpDatabase}=require('./fixtures/db')

beforeEach(setUpDatabase)

// afterEach(()=>{
//     console.log('afterEach')
// })

test('Should signup a new user',async ()=>{
    const response= await request(app).post('/users').send({
        name:'venkatesh',
        email:'vgolla41@conestogac.on.ca',
        password:'Venky123!'
    }).expect(201)
    //Assert that the database was changed properly
    const user=await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about the response
    expect(response.body).toMatchObject({
        user:{
            name:'venkatesh',
            email:'vgolla41@conestogac.on.ca'
        },
        token:user.tokens[0].token
    })
    expect(user.password).not.toBe('Venky123!')
})

test('Should login existing user',async ()=>{
    const response=await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)
    const user= await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user',async ()=>{
    await request(app).post('/users/login').send({
        email:userOne.email,
        password:'thisismypassword'
    }).expect(400||'Bad Request')
})

test('Should get profile for user',async ()=>{
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for Unauthenticated user',async ()=>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user',async ()=>{
    await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user=await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unAuthorized user',async ()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar',async ()=>{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/profile-pic.jpg')
    .expect(200)
    const user=await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update name of user',async()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name:'Golla Venkatesh'
    })
    .expect(200)

    const user=await User.findById(userOneId)
    expect(user.name).toBe('Golla Venkatesh')
})

test('Should not update invalid user fields like location',async ()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        location:'Waterloo'
    })
    .expect(400)
})