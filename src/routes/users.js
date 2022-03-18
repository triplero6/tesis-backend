const express = require('express');
const router = express.Router();

const pool = require('../database');

router.post('/edit/', async (req,res) => {
    const { Nombre, Apellido, Mail} = req.body;
    const FotoPerfil = req.file.filename;
    const idUsuario = req.user.idUsuario;

    const rows = await pool.query('CALL MiPalestra.spEditUser(?,?,?,?,?)', [idUsuario, Nombre, Apellido, FotoPerfil, Mail]);
    console.log(rows);
    if(rows.serverStatus==2){
        res.send('Perfil actualizado correctamente');
    }else{
        res.send('No se pudo actualizar la base de datos')
    }
});

router.get('/solicitudes', async (req, res) => {
    const rows = await pool.query('CALL MiPalestra.spListSolicitudes()');
    const solicitudes = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    console.log(solicitudes);

    res.send(solicitudes);
})

router.get('/usuarios', async (req, res) => {
    const rows = await pool.query ('CALL MiPalestra.spListUsuarios()');
    const usuarios = Object.values(JSON.parse(JSON.stringify(rows)))[0];

    res.send(usuarios);
})

router.put('/disabled', async (req, res) => {
    const {userId, disabledUser} = req.body;
    console.log(userId, disabledUser);
    const rows = await pool.query('CALL MiPalestra.spDisabledUser(?)', [userId]);
    console.log(rows);
    res.send('deshabilitado');
})


module.exports = router;