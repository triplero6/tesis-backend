const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;
const helpers = require('../lib/helpers');


const pool = require('../database');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img/uploads'), 
    filename: (req,file,cb, filename) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});


const upload = multer({ storage }).single('Perfil');

router.put('/edit', async (req,res) => {
    const { idUsuario, Nombre, Apellido, Mail, Rol} = req.body;
    
    try{
        await pool.query('CALL MiPalestra.spEditUser(?,?,?,?)', [idUsuario, Nombre, Apellido, Mail]);
        res.send('Perfil actualizado');

    } catch (err){
        console.error(err);
        res.send('Error al modificar el usuario');
    }
});

router.put('/editphoto', upload, async(req, res) => {
    const {idUsuario} = req.body;
    const FotoPerfil = req.file.filename;

    try{
        await pool.query('CALL MiPalestra.spEditUserPhoto(?,?)', [idUsuario, FotoPerfil]);
        res.send('Perfil actualizado');
    } catch (err){
        console.error(err);
        res.send('Error al modificar al usuario');
    }

})

//router.put('/edit/comision/:id', async (req, res) => {
//    const idUsuario = req.params.id;
//    try{
//        await pool.query()
//    }
//})

router.get('/solicitudes', async (req, res) => {
    const rows = await pool.query('CALL MiPalestra.spListSolicitudes()');
    const solicitudes = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    console.log(solicitudes);

    res.send(solicitudes);
});

router.get('/usuarios', async (req, res) => {
    const rows = await pool.query ('CALL MiPalestra.spListUsuarios()');
    const usuarios = Object.values(JSON.parse(JSON.stringify(rows)))[0];

    res.send(usuarios);
});

router.put('/disabled', async (req, res) => {
    const { idUsuario } = req.body;
    try{
        const rows = await pool.query('CALL MiPalestra.spDisabledUser(?)', [idUsuario]);
        res.send('Usuario deshabilitado')        
    } catch (err){
        console.error(err);
        res.send('Error al deshabilitar el usuario')
    }

})

router.put('/enabled', async (req, res) => {
    const { idUsuario } = req.body;
    try{
        const rows = await pool.query('CALL MiPalestra.spEnabledUser(?)', [idUsuario]);
        res.send('Usuario habilitado');
    } catch (err){
        console.error(err);
        res.send('Error al habilitar el usuario');
    }
});

router.get('/profile/:id', async (req, res) => {
    const idUsuario = req.params.id;
    try{
        const rows = await pool.query('CALL MiPalestra.spUserProfile(?)', [idUsuario]);
        const usuario = Object.values(JSON.parse(JSON.stringify(rows)))[0][0];
        res.send(usuario);
    } catch(err){
        console.error(err)
        res.send('Error al cargar el usuario');
    }
});

router.get('/profile/comision/:id', async (req, res) => {
    const idUsuario = req.params.id;
    try{
        const row = await pool.query('CALL MiPalestra.spUserComision(?)', [idUsuario]);
        const comision = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
        res.send(comision)
    }catch(err) {
        console.error(err);
        res.send('Error al cargar la comision')
    }
})

router.put('/password', async (req, res) => {
    const {oldPassword, newPassword, idUsuario} = req.body
    try{
        rows = await pool.query('CALL MiPalestra.spUserPassword(?)', [idUsuario]);
        const password = Object.values(JSON.parse(JSON.stringify(rows)))[0][0].Contrasenia;
        //const validPassword = await helpers.matchPassword(oldPassword, password);
        if(true){
            const cifrada = await helpers.encryptPassword(newPassword);
            await pool.query('CALL MiPalestra.spChangePassword(?,?)', [idUsuario, cifrada]);
            res.send('Contraseña cambiada');
        } else{
            res.send('Contraseña actual ingresada incorrectamente');
        }
        console.log(password);
    } catch (err){
        console.error(err);
        res.send('Error al cambiar la contraseña');
    }
});

router.delete('/:id', async (req, res) => {
    const idUsuario = req.params.id;
    const rows = await pool.query('CALL MiPalestra.spDeserializeUser(?)', [idUsuario]);
    const User = Object.values(JSON.parse(JSON.stringify(rows)))[0][0];
    if(User.EstadoUsuario === 1){
        return res.status(400).json({
            errors: 'No se puede eliminar usuario ya que se encuentra activo en MiPalestra'
        });
    }else {
        try{
            await pool.query('CALL MiPalestra.spDeleteUser(?)', [idUsuario]);
            res.send("Usuario eliminado correctamente");
        }catch (err){
            console.error('Error: ', err);
            res.status(400).json({
                errors: 'Error al eliminar usuario'
            });
        }
    }
});

router.get('/teamroles/:id', async (req, res) => {
    const idUsuario = req.params.id;
    console.log(idUsuario)
    try{
        const rows = await pool.query('CALL MiPalestra.spGetRolDirigente(?)', [idUsuario]);
        const roles = Object.values(JSON.parse(JSON.stringify(rows)))[0];
        res.send(roles);
    } catch (e){
        console.error(e);
        res.send('Error al cargar roles de Equipo');
    }
});

router.get('/groupsroles/:id', async (req, res) => {
    const idUsuario = req.params.id;
    try{
        const rows = await pool.query('CALL MiPalestra.spGetRolGrupo(?)', [idUsuario]);
        const roles = Object.values(JSON.parse(JSON.stringify(rows)))[0];
        res.send(roles);
    } catch (e){
        console.error(e);
        res.send('Error al cargar roles de grupo');
    }
})



module.exports = router;