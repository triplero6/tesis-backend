const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/', async (req,res) => {
    const rows = await pool.query('CALL MiPalestra.spListEquipos()');
    const teams = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(teams);
});

router.post('/add', async (req, res) => {
    await pool.beginTransaction();
});

module.exports = router;

