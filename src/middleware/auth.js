const jwt=require('jsonwebtoken')
const User=require('../models/user')

const auth=async (req,res,next)=>{
    try{
        //Bearer in the header named authorization will be replaced with '' means nothing i.e we are just removing bearer from it
        const token=req.header('Authorization').replace('Bearer ','')
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})
        if(!user){
            throw new Error()
        }
        req.user=user
        req.token=token
        //we have assigned the authenticated user details to a variable user so that we can user this user in the caller function from user
        next()
    }catch(e){
        res.status(401).send({error:'Please Authenticate yourself'})
    }
}

module.exports=auth