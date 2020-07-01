const mongoose=require('mongoose')
const validator=require('validator')

try{
    mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true,
    useFindAndModify:false
})
    console.log("Connected to DB")
}
catch(error){
    console.log(error)
}






