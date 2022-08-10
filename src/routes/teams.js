const express = require('express');
const router = express.Router();
const moment = require('moment');
const pool = require('../database');
const { resetPasswordMail } = require('../lib/helpers');
const helpers = require('../lib/helpers');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/img/uploads'), 
    filename: (req,file,cb, filename) => {
        cb(null, uuid() + path.extname(file.originalname));
    }
});

const upload = multer({ storage }).single('FichaEvaluacion');


router.get('/', async (req,res) => {
    const rows = await pool.query('CALL MiPalestra.spListEquipos()');
    const teams = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(teams);
});

router.post('/add', async (req, res) => {
    const { TipoEquipo , Descripcion, Anio, FechaDesde, FechaHasta, Asesor, Numero, Lugar, NombreCasa, EquipoCocina, Sexo } = req.body;
    const newFechaDesde = helpers.formatSQL(FechaDesde);
    const newFechaHasta = helpers.formatSQL(FechaHasta);
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(function(err) {
            if (err) {                  //Transaction Error (Rollback and release connection)
                connection.rollback(function() {
                    connection.release();
                    //Failure
                });
            } else {
                connection.query('CALL MiPalestra.spAddTeam(?,?,?,?,?, @out_param); SELECT @out_param AS lastId', [TipoEquipo, Descripcion, Anio, newFechaDesde, newFechaHasta], function(err, results) {
                    if (err) {          //Query Error (Rollback and release connection)
                        connection.rollback(function() {
                            connection.release();
                            console.log(err);
                            //Failure
                        });
                    } else {
                        if (TipoEquipo ===1){
                            const Equipo = Object.values(JSON.parse(JSON.stringify(results)))[1][0].lastId;
                            connection.query('CALL MiPalestra.spAddTeamPM(?,?,?,?,?,?,?);', [Equipo, Asesor, Numero, Lugar, NombreCasa, EquipoCocina, Sexo], function(err, results){
                                if(err){
                                    connection.rollback(function(){
                                        connection.release();
                                        console.log(err)
                                        res.send('Algo salio mal')
                                    })
                                } else {
                                    connection.commit(function(err){
                                        if(err){
                                            connection.rollback(function(){
                                                connection.release();
                                                res.send('Algo salio mal');
                                            })
                                        } else{
                                            connection.release();
                                            res.send('Equipo agregado');
                                        }
                                    })
                                }
                            });  
                        } else{
                            connection.commit(function(err) {
                                if (err) {
                                    connection.rollback(function() {
                                        connection.release();
                                        res.send('Algio salio mal')
                                    });
                                } else {
                                    connection.release();
                                    res.send('Equipo agregado')
                                }
                            });
                        }
                    }
                });
            }    
        });
    });

});

router.put('/edit', async (req, res) => {
    const {idEquipo, idTipoEquipo, Descripcion, Lugar, NombreCasa, dirigente, idAsesor, FechaDesde, FechaHasta} = req.body;
    console.log(FechaDesde, FechaHasta)
    const newFechaDesde = helpers.formatSQL(FechaDesde);
    const newFechaHasta = helpers.formatSQL(FechaHasta);
    pool.getConnection(function(err, connection){
        connection.beginTransaction(function(err){
            if(err){
                connection.rollback(function(){
                    connection.release();
                    console.log('Err2: ', err);
                });
            } else {
                connection.query('CALL MiPalestra.spEditTeam(?, ?)', [idEquipo, Descripcion],
                function(err, results){
                    if(err){
                        connection.rollback(function(){
                            connection.release();
                            console.log('Err1: ', err);

                        })
                    } else{
                        connection.query('CALL MiPalestra.spDeleteUsersTeams(?)', [idEquipo],
                        function(err, results){
                            if(err){
                                connection.rollback(function(){
                                    connection.release();
                                    res.send('Error al editar el equipo');
                                })
                            } else{
                                var query = '';
                                var variables = [];

                                dirigente.map((integrante) => {
                                    query += `CALL MiPalestra.spAddUserInTeam(?,?,?,?,?);`
                                    variables.push(integrante.idUsuario, idEquipo, integrante.rol, newFechaDesde, newFechaHasta);
                                })
                                console.log(query, variables)
                                connection.query(query, variables,
                                    function(err, results){
                                        if(err){
                                            console.log(err)
                                            connection.rollback(function(){
                                                connection.release();
                                                res.send('Error al editar el equipo');
                                            })
                                        }
                                    })
                            }
                        })
                        
                        if( idTipoEquipo !== 1){
                           
                            connection.commit(function(err){
                                if(err){
                                    connection.rollback(function(){
                                        connection.release();
                                        res.send('Error al editar equipo');
                                        console.log('Err2: ',err);
                                    })
                                }else{
                                    connection.release();
                                    res.send('Equipo editado correctamente');
                                }
                            })
                        } else{
                            connection.query('CALL MiPalestra.spEditTeamPM(?,?,?,?)', [idEquipo, Lugar, NombreCasa, idAsesor], 
                            function(err, results){
                                if(err){
                                    connection.rollback(function(){
                                        connection.release();
                                        res.send('Error al editar equipo');
                                        console.log('Err3: ',err);
                                    })
                                }else{
                                    connection.commit(function(err){
                                        if(err){
                                            connection.rollback(function(){
                                                connection.release();
                                                res.send('Error al editar equipo');
                                            })
                                        }else{
                                            connection.release();
                                            res.send('Equipo editado correctamente');
                                        }
                                    })
                                
                                }
                            })
                        }
                    }
                });
            }
        })
    })
});

router.put('/delete', async (req, res) => {
    const { idEquipo, idTipoEquipo} = req.body;
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(function(err) {
            if (err) {                  //Transaction Error (Rollback and release connection)
                connection.rollback(function() {
                    connection.release();
                    //Failure
                });
            } else {
                if(idTipoEquipo !== 1){
                    connection.query('CALL MiPalestra.spDeleteTeam(?)', [idEquipo], 
                    function(err, results){
                        if(err){
                            connection.rollback(function(){
                                connection.release();
                                console.log(err);
                            })
                        }else{  
                            connection.commit(function(err) {
                                if (err) {
                                    connection.rollback(function() {
                                        connection.release();
                                        res.send('Algio salio mal')
                                    });
                                } else {
                                    connection.release();
                                    res.send('Equipo eliminado correctamente')
                                }
                            });
                        }
                    })
                }else{
                    connection.query('CALL MiPalestra.spDeleteUsersTeams(?)', [idEquipo], 
                    function(err, results){
                        if(err){
                            connection.rollback(function(){
                                connection.release();
                                console.log(err);
                            });
                        }else{
                            connection.query('CALL MiPalestra.spDeleteTeamPM(?)', [idEquipo],
                            function(err, results){
                                if(err){
                                    connection.rollback(function(){
                                        connection.release();
                                        console.log(err);
                                    })
                                }else{
                                    connection.query('CALL MiPalestra.spDeleteTeam(?)', [idEquipo],
                                    function(err, results){
                                        if(err){
                                            connection.rollback(function(){
                                                connection.release();
                                                console.log(err);
                                            })
                                        }else{
                                            connection.commit(function(err) {
                                                if (err) {
                                                    connection.rollback(function() {
                                                    connection.release();
                                                    res.send('Algio salio mal')
                                                    });
                                                } else {
                                                    connection.release();
                                                     res.send('Equipo eliminado correctamente')
                                                }
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
            }    
        });
    });
});


router.get('/asesores', async (req, res) => {
    const rows = await pool.query('CALL MiPalestra.spListAsesores()');
    const asesores = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(asesores);

})

router.get('/edit/:id', async (req, res) => {
    const idEquipo = req.params.id;
    try{
        const row = await pool.query('CALL MiPalestra.spGetEditTeam(?)', [idEquipo]);
        const equipo = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
        const row1 = await pool.query('CALL MiPalestra.spGetTeamMembers(?)', [idEquipo]);
        const miembros = Object.values(JSON.parse(JSON.stringify(row1)))[0];
        res.send([equipo, miembros]);
    } catch(err){
        console.error(err);
    }
    
});

router.get('/editpm/:id', async (req, res) => {
    const idEquipo = req.params.id;
    try{
        const row = await pool.query('CALL MiPalestra.spGetEditTeamPM(?)', [idEquipo]);
        const equipo = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
        const row1 = await pool.query('CALL MiPalestra.spGetTeamMembers(?)', [idEquipo]);
        const miembros = Object.values(JSON.parse(JSON.stringify(row1)))[0];
        res.send([equipo, miembros]);
    } catch(err){
        console.error(err);
    }
    
})

router.get('/select/:id', async (req, res) => {
    const idEquipo = req.params.id;
    try{
        const row = await pool.query('CALL MiPalestra.spSelectEditTeam(?)', [idEquipo]);
        const equipos = Object.values(JSON.parse(JSON.stringify(row)))[0];
        res.send(equipos);w
    }catch (err){
        console.log(err);
    }
});

router.post('/evaluations', upload, async (req, res) =>{
    const {idEquipo, idTipoEquipo} = req.body;
    const FichaEvaluacion = req.file.filename;
    console.log(idEquipo, idTipoEquipo,  FichaEvaluacion)

    try{
        await pool.query('CALL MiPalestra.spAddEvaluationTeam(?,?,?);', [idEquipo, idTipoEquipo, FichaEvaluacion]);
        res.send('Evaluación cargada correctamente');
    } catch(err){
        console.log('Error al cargar evaluacion: ', err);
        res.send('Error al cargar la evaluacion')
    }
});

router.put('/evaluations', upload, async (req, res) => {
    const {idEvaluacionEquipo} = req.body;
    const FichaEvaluacion = req.file.filename;

    try{
        await pool.query('CALL MiPalestra.spEditEvaluationTeam(?,?)', [idEvaluacionEquipo, FichaEvaluacion]);
        res.send('Evaluación actualizada correctamente');
    } catch(err){
        console.log('Error al editar evaluación', err);
        res.send('Error al editar evaluacion');
    }
})

module.exports = router;

