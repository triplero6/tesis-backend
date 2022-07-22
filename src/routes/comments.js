const express = require('express');
const moment = require('moment');
const pool = require('../database');

const router = express.Router();

router.get('/:publicacion', async (req, res) => {
    const idPublicacion = req.params.publicacion;
    const rows = await pool.query('CALL MiPalestra.spComentarioPublicacion(?)', [idPublicacion]);
    const comentarios = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(comentarios);
});

router.post('/add', async (req, res) => {
    const {idUsuario, idPublicacion, Contenido } = req.body;
    try{
        await pool.query('CALL MiPalestra.spAddComment(?,?,?)', [idUsuario, idPublicacion, Contenido]);
        res.send('Comentario agregado satisfactoriamente');
    } catch (err){
        console.log(err);
        res.send('Error al agregar el comentario');
    }
});

router.delete('/:id', async (req, res) => {
    const idComentario = req.params.id;
    try{
        await pool.query('CALL MiPalestra.spDeleteComment(?)', [idComentario]);
        res.send('Comentario eliminado satisfactoriamente');
    } catch(err){
        console.log(err);
        res.send('Error al eliminar comentario');
    }

})
module.exports = router;