const express=require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()

app.use(express.json()) //This parses incoming json to object so that we can use them
app.use(userRouter) //Adding router from routers/user
app.use(taskRouter)

module.exports=app

