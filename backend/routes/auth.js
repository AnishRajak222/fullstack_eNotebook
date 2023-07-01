const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET ='Hulahulah0hoh@ha';
// create user --- POST "/api/auth/createuser" login not required not required
router.post('/createuser',[
    body('name','Name not valid').isLength({min:1}),
    body('email','Enter a valid email').isEmail(), //isEmail()
    body('password','Password length must be atleast 8 characters').isLength({min: 8}),
], async (req,res)=>{
   let success = false;
   const errors = validationResult(req);
   if(!errors.isEmpty()){
        success = false;
        return res.status(400).json({success,errors: errors.array()});
   }
   try{
    let user = await User.findOne({email: req.body.email});
    if (user){
        success = false;
        return res.status(400).json({success,error: "A user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const sPass = await bcrypt.hash(req.body.password, salt);    
    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: sPass,//req.body.password, with salt :)
    });
    const data = {
        user:{
            id: user.id
        }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({success,authtoken});
    } catch(error){
    
        console.error(error);
        res.status(500).send("Server error");
    }

});

// authenticate user --- POST "/api/auth/login" login not required not required
router.post('/login',[
    body('email','Enter a valid email').isEmail(), //isEmail()
    body('password','Password cannot be blank').exists(),
], async (req,res)=>{
    let success = false;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
    }
    const {email,password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            success = false;
            return res.status(400).json({success,error: "Wrong credentials"});
        }
        const passwordcompare = await bcrypt.compare(password, user.password);
        if(!passwordcompare){
            success = false;
            return res.status(400).json({success,error: "Wrong credentials"});
        }
        const data = {
            user:{
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success,authtoken});
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// get loggedin user details --- POST "/api/auth/getuser" login  required not required
router.post('/getuser', fetchuser,async (req,res)=>{    

    try {
        userId =req.user.id;
        const user = await User.findById(userId).select("-password")
        res.send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

module.exports = router