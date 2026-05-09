const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const session = require("express-session");
require("dotenv").config();
const connectDb = require("./config/db");
const flash = require('connect-flash'); // Step 1: Already imported
const methodOverride = require('method-override');

const Registration = require("./models/Registration");

// inits
const app = express();
const port = 3001;

// configs
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
connectDb();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride('_method')); 

// SESSION (Must stay before Flash and Passport)
app.use(session({
    secret: "blogsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, 
        secure: false 
    }
}));

// --- FLASH MIDDLEWARE (THE MISSING FIX) ---
// This line attaches the .flash() function to the 'req' object
app.use(flash()); 

// --- GLOBAL VARIABLES (FOR MESSAGES) ---
// This allows your Pug files to see 'success_msg' and 'error_msg'
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.user || null; // Good to have user available globally too
    next();
});

// PASSPORT (Must stay after Session and Flash)
app.use(passport.initialize());
app.use(passport.session());

passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

// ROUTES (Must stay after all Middleware)
app.use("/", require("./routes/registrationRoutes"));
app.use("/", require("./routes/blogRoutes"));

app.listen(port, () => console.log(`listening on port ${port}`));