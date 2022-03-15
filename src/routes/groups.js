const express = require('express');
const moment = require('moment');
const router = express.Router();

const pool = require('../database');

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
})

module.exports = router;