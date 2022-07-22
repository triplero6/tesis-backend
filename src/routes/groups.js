const express = require('express');
const moment = require('moment');
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


const upload = multer({ storage }).single('Imagen');

router.get('/', async (req,res) => {
    const rows = await pool.query('CALL MiPalestra.spListGrupos()');
    const groups = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(groups);
});

router.get('/comisiones', async (req, res) => {
    const rows = await pool.query('CALL MiPalestra.spListComisiones()');
    const comisiones = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(comisiones);
});

router.post('/nuevo', async (req, res) => {
    console.log(req.body)
    const { idTipoGrupo, NombreGrupo, FechaFundacion, Apostolado, Descripcion} = req.body;
    const date = moment(
        FechaFundacion,
        "YYYY-MM-DDTHH:mm:ss"
    );
    let newFechaFundacion = date.format("YYYY-MM-DD HH:mm:ss");
    const rows = await pool.query('CALL MiPalestra.spAddGroup(?,?,?,?,?)', [idTipoGrupo, NombreGrupo, newFechaFundacion, Apostolado, Descripcion]);
    console.log(rows);
    res.send('hola');
});

router.put('/delete', async (req, res) => {
    const { idGrupo } = req.body;
    try {
        const rows = await pool.query('CALL MiPalestra.spDeleteGroup(?)', [idGrupo]);
    } catch (err) {
        console.log(err);
        res.send('Error al eliminar el grupo');
    }
    res.send('Grupo eliminado satisfactoriamente')
});

router.put('/edit', upload, async (req, res) => {
    const { idUsuario, NombreGrupo, FechaFundacion, Apostolado, Descripcion} = req.body;
    const  Imagen = req.file.filename;
    console.log(Imagen)
    try{
        const rows = await pool.query('CALL MiPalestra.spEditGroup(?,?,?,?,?,?)', [idUsuario, NombreGrupo, FechaFundacion, Apostolado, Descripcion, Imagen]);
    } catch (err){
        console.error(err);
        
        res.send('Error al eliminar el usuario');
    }
    res.send('Grupo modificado satisfactoriamente');
});

router.put('/editcomision', async (req, res) => {
    const {idUsuario, Grupo, Rol} = req.body;
    try{
        await pool.query('CALL MiPalestra.spUpdateComision(?,?,?)', [idUsuario, Grupo, Rol]);
        res.send('Comision del usuario editada correctamente');
    } catch (err){
        console.log(err);
        res.send('Error al editar el usuario');
    }
});

router.post('/add/comision', async (req, res) => {
    const {idUsuario, Grupo, Rol} = req.body;
    try{
        await pool.query('CALL MiPalestra.spAddComision(?,?,?)', [idUsuario, Grupo, Rol]);
        res.send('Comision agregada satisfactoriamente');
    }catch (err){
        console.log(err);
        res.send('Error al editar el usuario');
    }
});

router.put('/delete/comision', async (req, res) => {
    const {idUsuario, Grupo} = req.body;
    console.log(idUsuario,Grupo);
    try{
        await pool.query('CALL MiPalestra.spDeleteComision(?,?)', [idUsuario, Grupo]);
        res.send('Comision eliminada correctamente');
    } catch(err){
        console.log(err);
        res.send('Error al eliminar la comision');
    }
})

router.put('/end/comision', async (req, res) => {
    const {idUsuario, Grupo} = req.body;
    try{
        await pool.query('CALL MiPalestra.spEndComision(?,?)', [idUsuario, Grupo]);
        res.send('Rol culminado con exito');
    } catch (err){
        console.log(err);
        res.send('Hubo un error')
    }
})

module.exports = router;