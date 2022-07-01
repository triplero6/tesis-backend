const express = require('express');
const moment = require('moment');
const pool = require('../database');

const router = express.Router();

router.get('/:publicacion', async (req, res) => {
    const idPublicacion = req.params.publicacion;
    const rows = await pool.query('CALL MiPalestra.spComentarioPublicacion(?)', [idPublicacion]);
    const comentarios = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(comentarios);
})

module.exports = router;