const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw Error('Email format is Invalid')
            }
        }
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number')
            }
        }
    },
    password:{
        type:String,
        trim:true,
        minlength:7,
        required:true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not be password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=await jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
    
}

userSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}

userSchema.statics.findByCredentials=async (email,password)=>{
    const user=await User.findOne({email})
    if(!user){
        throw new Error('Unable to Login')
    }
    const isMatch=await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('Unable to Login')
    }
    return user
}

//creating middleware (do not use arrow as functions binding is imp) to use hash the password before saving user to database
userSchema.pre('save',async function(next){  
    const user=this
    if(user.isModified('password')){  //this statement executes only when password is being modified i.e, when a new user is being created and when password of a user is being updated
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})

//Delete User tasks when user is removed
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('User',userSchema)

module.exports=User