const express = require('express');
const moment = require('moment');
const pool = require('../database');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;

const router = express.Router();

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img/uploads'), 
    filename: (req,file,cb, filename) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).single('File');

router.get('/', async (req,res) => {
    const rows = await pool.query('CALL MiPalestra.spPublicaciones()');
    const publicaciones = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(publicaciones);
});

router.get('/grupo/:id', async (req, res) => {
    const  idGrupo = req.params.id;
    console.log(idGrupo)
    try{
        const rows = await pool.query('CALL MiPalestra.spPublicacionesComunidad(?)', [idGrupo]);
        const publicaciones = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(publicaciones);
    } catch (err){
        console.log(err);
        res.send('Error al cargar las publicaciones');
    }
})

router.get('/movimiento', async (req, res) => {
    const rows = await pool.query('CALL MiPalestra.spPublicacionesMovimiento()');
    const publicaciones = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(publicaciones);
});

router.get('/home', async (req, res) => {
    const rows = await pool.query('CALL MiPalestra.spListHomeNovedades()');
    console.log('hola', rows)
    const publicaciones = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(publicaciones);
});

router.get('/novedades', async (req, res) => {
    try {
        const rows = await pool.query('CALL MiPalestra.spListNovedades()');
        const novedades = Object.values(JSON.parse(JSON.stringify(rows)))[0];
        res.send(novedades);
    }catch (err){
        console.error('Error: ', err);
        res.status(400).json({
            errors: 'Error al cargar novedad'
        });
    }
})

router.post('/add', async (req, res) => {
    const {idGrupo, idUsuario, Titulo, Cuerpo, EstadoPublicacion, FechaPublicacion, Tipo, Destino} = req.body;
    console.log(idGrupo, idUsuario, Titulo, Cuerpo, EstadoPublicacion, FechaPublicacion, Tipo, Destino);
    const date = moment(
        FechaPublicacion,
        "YYYY-MM-DDTHH:mm:ss"
    );
    let newFechaPublicacion = date.format("YYYY-MM-DD HH:mm:ss");
     try {
        await pool.query('CALL MiPalestra.spAddPublicacion(?,?,?,?,?,?,?,?)', [idGrupo, idUsuario, Titulo, Cuerpo, EstadoPublicacion, newFechaPublicacion, Tipo, Destino]);
        res.send('Publicacion agregada para revision');
     } catch (err){
         console.error('Error al cargar la publicacion: ', err);
     }
} )

router.post('/novedades/add', upload, async (req, res) => {
    const {idUsuario, Titulo, Cuerpo, EstadoPublicacion} = req.body;
    const  Foto = req.file.filename;
     try {
         await pool.query('CALL MiPalestra.spAddNovedad(?,?,?,?,?)', [idUsuario, Titulo, Cuerpo, Foto, EstadoPublicacion]);
         res.send('Publicacion agregada para revision');
     } catch (err){
         console.error('Error al cargar la publicacion: ', err);
     }
} )


router.put('/activate/:id', async (req, res) => {
    const idPublicacion = req.params.id;
    try{
        await pool.query('CALL MiPalestra.spActivatePublicacion(?)', [idPublicacion]);
        res.send('Publicación activada correctamente')
    } catch (err){
        console.error('Error: ', err);
    }
});

router.put('/disable/:id', async (req, res) => {
    const idPublicacion = req.params.id;
    console.log(idPublicacion)
    try{
        await pool.query('CALL MiPalestra.spDeactivatePublicacion(?)', [idPublicacion]);
        res.send('Publicación desactivada correctamente')
    } catch (err){
        console.error('Error: ', err);
    }
});

router.delete('/:id', async (req, res) => {
    const idPublicacion = req.params.id;
    try {
        await pool.query('CALL MiPalestra.spDeletePublication(?)', [idPublicacion]);
        res.send('Publicación eliminada correctamente');
    } catch (err){
        console.error('Error: ', err);
        res.status(400).json({
            errors: 'Error al eliminar publicación'
        });
    }
})

router.get('/novedades/:id', async (req, res) => {
    const idPublicacion = req.params.id;
    try{
        const rows = await pool.query('CALL MiPalestra.spGetPublicacion(?)', [idPublicacion]);
        const publicacion = Object.values(JSON.parse(JSON.stringify(rows)))[0][0];
        res.send(publicacion);
    }catch (err){
        console.error('Error: ', err);
        res.status(400).json({
            errors: 'Error al cargar novedad'
        });
    }
});

router.put('/edit', async (req, res) => {
    const { idPublicacion, Titulo, Cuerpo } = req.body;
    try{
        await pool.query('CALL MiPalestra.spEditPublicacion(?,?,?)', [idPublicacion, Titulo, Cuerpo]);
        res.send('Publicacion editada correctamente');
    } catch(err){
        console.log('Error editar publicacion: ', err);
        res.send('Error editar publicacion');
    }
});

router.get('/edit/:id', async (req, res) => {
    const idPublicacion = req.params.id;
    try{
        const row = await pool.query('CALL MiPalestra.spGetEditPublicacion(?)', [idPublicacion]);
        const publicacion = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
        res.send(publicacion);
    } catch(err){
        console.log('Error al cargar publicacion de edit: ', err);
        res.send('Error al cargar publicacion');
    }
});

module.exports = router;