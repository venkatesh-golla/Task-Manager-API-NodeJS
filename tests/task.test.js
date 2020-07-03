const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { userOneId, userOne, setUpDatabase,userTwo,taskOne } = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should create a task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Task one from testing'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Task of userOne', async () => {
    const response=await request(app)
    .get('/tasks')  
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toEqual(2)
})

test('User2 Should not be able delete User1s Task',async ()=>{
    const response=await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization',`Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

    const task=await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
    
})