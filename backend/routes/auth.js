const express = require('express');
const router = express.Router();
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Hellomynameis@farhan';


//Create a user using: POST '/api/auth/createUser. No login required
router.post('/createUser', [
    body('name').isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 5 })

], async (req,res) => {

  //if error occurs then it will show the bad requests as well as errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
  //Check if email is already exist or not
  try{
  let user = await User.findOne({email: req.body.email});

  if(user){
    return res.status(400).json({error: "Email already exist"})
  }

  const salt = await bcrypt.genSalt(10);
  const secPassword = await bcrypt.hash(req.body.password, salt);

    user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPassword,
      })

    const data = {
      user: {
        id: user.id
      }
    }
      
    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({authToken: authToken})
  }catch(err){
    console.log(err.message)
    res.status(500).send("Some error occured")
  }
})


//Login existing user with correct credentials on POST: '/api/login'

router.post('/login', [ 
  body('email', 'Enter a valid email').isEmail(), 
  body('password', 'Password cannot be blank').exists(), 
], async (req, res) => {

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {email, password} = req.body;
  try {
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({error: "Please try to login with correct credentials"});
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if(!passwordCompare){
      return res.status(400).json({error: "Please try to login with correct credentials"});
    }

    const data = {
      user:{
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);
    res.json({authtoken})

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


})

module.exports = router