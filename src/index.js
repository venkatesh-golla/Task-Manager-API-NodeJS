const express=require('express')
require('./db/mongoose')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()
const port=process.env.PORT

/* app.use((req,res,next)=>{
    res.status(503).send('Website is under maintenance')
}) */

app.use(express.json()) //This parses incoming json to object so that we can use them
app.use(userRouter) //Adding router from routers/user
app.use(taskRouter)

//Without middleware: new request-> run route handler

//with middleware: new request-> do something(Like a function)->run route handler



app.listen(port,()=>{
    console.log('Server is up on port'+port)
})

