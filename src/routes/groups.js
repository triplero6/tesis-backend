const express = require('express');
const moment = require('moment');
const router = express.Router();

const pool = require('../database');
const { encryptPassword } = require('../lib/helpers');

router.get('/', async (req,res) => {
    const rows = await pool.query('CALL MiPalestra.spListGrupos()');
    const groups = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(groups);
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

router.put('/edit', async (req, res) => {
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

module.exports = router;