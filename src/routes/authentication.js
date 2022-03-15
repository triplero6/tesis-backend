const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const pool = require('../database');

const helpers = require('../lib/helpers');

const { isLoggedIn, isNotLoggedIn } = require('../lib/auth');

router.get('/signup', (req,res) => {
    console.log(req.flash('error'))
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/signupsuccess',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/signupsuccess', (req,res) => {
    res.send('Registro completado')
})

router.get('/signin', (req,res) => {
    res.send('Iniciar Sesion')
});

router.post('/signin', isNotLoggedIn, (req,res, next) => {
    passport.authenticate('local.signin', {
        successRedirect: '/signinsuccess',
        failureRedirect: '/signin',
        failureFlash: true
    })(req,res,next);
});

router.get('/signinsuccess', (req, res) => {
    res.send('Bienvenido')
})

router.get('/profile', isLoggedIn, (req, res) => {
    res.send('Profile');
});

router.get('/logout', (req, res) => {
    req.logOut();
    res.clearCookie('connect.sid', {
        path: '/',
      }).status(200).send('ok');
});

router.get('/user', (req, res) => {
    console.log(req.user);
    console.log(req.session);

    if(req.user){
        console.log(req.user)
        res.json(req.user);
    }
    else{
        res.send('no hay sesion iniciada')
    }
})

router.put('/forgotpassword', async (req, res) => {
    const { email } = req.body;

    const rows = await pool.query('CALL MiPalestra.spSearchByMail(?)', [email]);
    const user = Object.values(JSON.parse(JSON.stringify(rows)))[0][0];
    
    const token = jwt.sign({_id: user.idUsuario}, process.env.JWT_RESET_PASSWORD, { expiresIn: '30m' });

    helpers.resetPasswordMail(email, token);

});

router.put('/resetpassword', async (req, res) => {
    try {
        const { token, newPassword} = req.body;

        if(!token) {
            res.status(401).json({
                confirmation: 'fail',
                message: 'Token no provisto'
            });    
        }            
        const decode = jwt.verify(token, process.env.JWT_RESET_PASSWORD);
        const cifrada = await helpers.encryptPassword(newPassword);
 
        const rows = await pool.query('CALL MiPalestra.spChangePassword(?,?)', [decode._id, cifrada]);
        console.log(rows);        

    } catch (err) {
        console.error(err);
        res.json({
            confirmation: 'fail',
            message: 'Token inválido.'
        })
    }
});

module.exports = router;