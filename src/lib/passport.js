const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const pool = require('../database');
const helpers = require('../lib/helpers');

passport.use('local.signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query('SELECT * FROM Usuarios WHERE username = ?', [username]);
    if (rows.length > 0){
        const user = rows[0];
        const validPassword = await helpers.matchPassword(password, user.Contrasenia);
        console.log(validPassword)
        if(validPassword){
            done(null, user);
        } else {
            done(null, false);
        }
    } else {
        return done(null, false)
    }
}))

passport.use('local.signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'Contrasenia',
    passReqToCallback: true
}, async (req, username, Contrasenia, done) => {
    const { Nombre, Apellido, PM, Mail} = req.body;
    const newUser = {
        Nombre,
        Apellido,
        Contrasenia,
        PM,
        Mail,
        username
    }
    const Cifrada = await helpers.encryptPassword(Contrasenia);
    pool.query('CALL MiPalestra.spInsertUser(?,?,?,?,?,?,?,@estado, @out_id); SELECT @estado AS estado; SELECT @out_id AS insertId', [Nombre, Apellido, Cifrada, 0,PM, Mail, username],
    (err, rows) => {
        if(err){
            return done(null, false);
        }
        const estado = Object.values(JSON.parse(JSON.stringify(rows)))[1][0].estado;
        const insertId = Object.values(JSON.parse(JSON.stringify(rows)))[2][0].insertId;
        if (estado == 0){
            return done(null, false);
        } else {
            newUser.idUsuario = insertId;
            return done(null, newUser);
        }
    })
}));

passport.serializeUser((user, done) => {
    console.log(user.idUsuario)
    done(null,user.idUsuario);
});

passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM Usuarios WHERE idUsuario = ?', [id]);
    done(null, rows[0]);
})