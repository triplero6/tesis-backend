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
app.use(cors());
app.use(session({
    secret: 'miPalestraSecret',
    resave: false,
    saveUninitialized: false,
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
app.use(multer({
    storage,
}).single('image'));


//Variables Globales
// app.use((req,res,next) => {
//     next();
// })

//Rutas
app.use(require('./routes'));
app.use(require('./routes/authentication'));
app.use('/users', require('./routes/users'));
app.use('/equipos', require('./routes/teams'));

//Archivos publicos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciando servidor
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
})