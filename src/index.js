const app=require('./app')

const port=process.env.PORT

/* app.use((req,res,next)=>{
    res.status(503).send('Website is under maintenance')
}) */
//Without middleware: new request-> run route handler

//with middleware: new request-> do something(Like a function)->run route handler

app.listen(port,()=>{
    console.log('Server is up on port'+port)
})

