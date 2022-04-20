const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;
const pool = require('../database');

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/img/uploads'), 
    filename: (req,file,cb, filename) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});


const upload = multer({ storage }).single('File');

router.get('/', async (req, res) => {
    try{
        const rows = await pool.query('CALL MiPalestra.spListArchivos()');
        let archivos = Object.values(JSON.parse(JSON.stringify(rows)))[0];
        res.send(archivos);
    } catch(err){
        console.error(err);
        res.send('Error al cargar la data');
    }
})

router.post('/add', upload, async (req, res) => {
    const { Nombre, Tipo} = req.body;
    // const Usuario = req.user.idUsuario
    const Usuario = 43;
    const  File = req.file.filename;
    const Ext = path.extname(File);
    console.log(File, Ext, Usuario, Nombre, Tipo);
    try{
         const rows = await pool.query('CALL MiPalestra.spAddFile(?,?,?,?,?)', [Usuario, Nombre, Tipo, Ext, File]);
         res.send('Archivo agregado satisfactoriamente');
    } catch (err){
        console.error(err);
        
        res.send('Error al subir el archivo');
    }
});

module.exports = router;