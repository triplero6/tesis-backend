const express = require('express');
const router = express.Router();
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/signup', (req,res) => {

});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true,/*
    session: false*/
}));

router.get('/signin', (req,res) => {
    res.send('Iniciar Sesion')
});

router.post('/signin', isNotLoggedIn, (req,res, next) => {

    passport.authenticate('local.signin', {
        successRedirect: '/profile',
        failureRedirect: '/signin',
        failureFlash: true/*,
        session: false*/
    })(req,res,next);
});

router.get('/profile', isLoggedIn, (req, res) => {
    res.send('Profile');
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;