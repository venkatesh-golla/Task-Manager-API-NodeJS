const express = require('express')
const User = require('../models/user')
const { update } = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()



// create a user using async await
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        await sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//Get all users from db using Async and await
//In order to use middleware we need to add middleware function in between the path and callback function as a parameter
//async call back function executes only if the next from auth middleware executes
router.get('/users', auth, async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user)
    }
    catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user)
    }
    catch (e) {
        res.status(500).send()
    }
})

//Get a User with specific id using async and await
/* router.get('/users/:id',async (req,res)=>{
    const _id=req.params.id
    try{
        const user=await User.findById(_id)
        
        if(!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch(e){
        console.log(e)
    }
}) */

//Update a user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate) {
        return res.status(400).send({ 'error': 'Invalid Update' })
    }
    try {
        const user = await User.findById(req.user._id)
        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        //We are using the above 3 lines instead of below 1 line in order to make middleware execute before updating so that password can be hashed using the middleware in user model
        //const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if (!user) {
            return res.status(400).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Delete a user using Async and await
router.delete('/users/me', auth, async (req, res) => {
    try {
        /*         const user=await User.findByIdAndDelete(req.user._id)
                if(!user){
                    return res.status(404).send()
                } */

        //getting the user from the auth middleware instead of getting user id from url and then finding the user id again here

        await req.user.remove()
        await sendCancelEmail(req.user.email, req.user.name)

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

const avatar = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload file of type jpg or jpeg or png'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, avatar.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 300, height: 300 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        console.log('error')
        res.status(404).send()
    }
})
module.exports = router