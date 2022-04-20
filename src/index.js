const express = require('express');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const uuid = require('uuid').v4;
const passport = require('passport');
const session = require('express-session');
const MySqlStore = require('express-mysql-session');
const { database } = require('./keys');
const  flash = require("connect-flash");
const cors = require('cors');
require('dotenv').config();

//Inicializaciones
const app = express();
require('./lib/passport');

//Configuraciones
app.set('port', process.env.PORT || 4000);

//Middlewares
app.use(cors({
    origin: 'http://palestra.com.ar:3000',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true 
}));
app.use(session({
    secret: 'miPalestraSecret',
    resave: true,
    saveUninitialized: true,
    store: new MySqlStore(database)
}));
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/img/uploads'), 
    filename: (req,file,cb, filename) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

exports.storage = storage;
//Variables Globales
// app.use((req,res,next) => {
//     next();
// })

//Rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/users', require('./routes/users'));
app.use('/equipos', require('./routes/teams'));
app.use('/grupos', require('./routes/groups'));
app.use('/files', require('./routes/files'))

//Archivos publicos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciando servidor
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
})