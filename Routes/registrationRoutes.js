const express = require("express");
const router = express.Router();

const Registration = require('../models/Registration');
const passport = require('passport');

router.get('/register',(req,res)=>{
    res.render('register')
});
router.post('/register',async(req,res)=>{
    try {
        const {firstName, lastName, email, password, role} = req.body;
        let user = await Registration.findOne({email:email.toLowerCase()});
        if(user){
            return res.render('login',{email: "email is already registered"});
        };
        const newuser = new Registration({
            firstName,
            lastName,
            email: email.toLowerCase(),
            role
        });
        console.log(newuser);
        await Registration.register(newuser,password, (err)=>{
            if(err){
                return res.redirect('register');
            }
        });
        res.redirect('login');
    } catch (error) {
        console.error(error)
        res.render('register', {error: error.message})
    }
})


router.get('/login', (req,res)=>{
    res.render('login')
});

// POST: Handle the login logic
router.post(
  "/login",
  passport.authenticate("local", { 
    failureRedirect: "/login", // If password is wrong, send them back to login
  }),
  (req, res) => {
    // If we reach this function, login was successful!
    
    // Role-Based Redirection
    if (req.user.role === "admin") {
      res.redirect("/adminBlogs");
    } else if (req.user.role === "user") {
      res.redirect("/blog");
    } else {
      res.redirect("/");
    }
  }
);




module.exports = router;