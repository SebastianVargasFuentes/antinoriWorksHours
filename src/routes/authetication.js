//in this lines are defined the objects to muse in this route, and a element named route is defined to navigate routes
const express = require('express');
const router = express.Router();
const passport = require('passport');

const { isNotLoggedIn } = require('../lib/auth');

const pool = require('../database');

router.get('/signup', isNotLoggedIn,(req,res) => {
    res.render('auth/signup');
});

/*
router.post('/signup', isNotLoggedIn,(req,res) => {
    const { password, confirm_password } = req.body;
    if(password != confirm_password)
    {
        req.flash('message','The passwords not equals');
        res.redirect('/signup');
    }
    else
    {
        passport.authenticate('local.signup', {
        successRedirect: '/main',
        failureRedirect: '/signup',
        failureFlash: true
        });
    }
    
});
*/
router.post('/signup',isNotLoggedIn ,passport.authenticate('local.signup', {
    successRedirect: '/main',
    failureRedirect: '/signup',
    failureFlash: true
  }));

router.get('/signin', isNotLoggedIn,(req,res) => {
    res.render('auth/signin');
});

router.post('/signin', isNotLoggedIn,(req,res, next) => {
    passport.authenticate('local.signin',{
        successRedirect: '/main',
        failureRedirect: '/signin',
        failureFlash: true
    })(req,res,next);
});

router.get('/logout',(req,res) => {
    req.logOut();
    res.redirect('/signin');
});

//this element is the export of the router object
module.exports = router;