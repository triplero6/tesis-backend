const express = require('express');
const router = express.Router();

const pool = require('../database');

router.get('/', async (req,res) => {
    const rows = await pool.query('CALL MiPalestra.spListEquipos()');
    const teams = Object.values(JSON.parse(JSON.stringify(rows)))[0];
    res.send(teams);
});

router.post('/add', async (req, res) => {
    const { TipoEquipo , Descripcion, Anio, Asesor, Numero, Lugar, NombreCasa, EquipoCocina, Sexo } = req.body;
    console.log(req.body)
    pool.getConnection(function(err, connection) {
        connection.beginTransaction(function(err) {
            if (err) {                  //Transaction Error (Rollback and release connection)
                connection.rollback(function() {
                    connection.release();
                    //Failure
                });
            } else {
                connection.query('CALL MiPalestra.spAddTeam(?,?,?, @out_param); SELECT @out_param AS lastId', [TipoEquipo, Descripcion, Anio], function(err, results) {
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
    const {idEquipo, idTipoEquipo, Descripcion, Lugar, Casa, Integrantes} = req.body;
    pool.getConnection(function(err, connection){
        connection.beginTransaction(function(err){
            if(err){
                connection.rollback(function(){
                    connection.release();
                });
            } else {
                connection.query('CALL MiPalestra.spEditTeam(?, ?)', [idEquipo, Descripcion],
                function(err, results){
                    if(err){
                        connection.rollback(function(){
                            connection.release();
                            console.error(err);
                        })
                    } else{
                        if( idTipoEquipo !== 1){
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
                        } else{
                            connection.query('CALL MiPalestra.spEditTeamPM(?,?,?)', [idEquipo, Lugar, Casa], 
                            function(err, results){
                                if(err){
                                    connection.rollback(function(){
                                        connection.release();
                                        res.send('Error al editar equipo');
                                    })
                                }else{
                                    connection.query('CALL MiPalestra.spDeleteUsersTeams(?)', [idEquipo],
                                    function(err, results){
                                        if(err){
                                            connection.rollback(function(){
                                                connection.release();
                                                res.send('Error al editar equipo');
                                            })
                                        }else{
                                            Integrantes.map((integrante) => {
                                                connection.query('CALL MiPalestra.spAddUserInTeam(?,?,?)', [integrante.idUsuario, integrante.idEquipo, integrante.Rol],
                                                function(err, results){
                                                    if(err){
                                                        connection.rollback(function(){
                                                            connection.release();
                                                            res.send('Error al editar equipo');
                                                        })
                                                    }
                                                })
                                            });
                                            connection.commit(function(err){
                                                if(err){
                                                    connection.rollback(function(){
                                                        connection.release();
                                                        res.send('Error al editar el equipo');
                                                    });
                                                }else {
                                                    connection.release();
                                                    res.send('Equipo editado correctamente');
                                                }
                                            })
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
        res.send(equipo);
    } catch(err){
        console.error(err);
    }
    
});

router.get('/editpm/:id', async (req, res) => {
    const idEquipo = req.params.id;
    try{
        const row = await pool.query('CALL MiPalestra.spGetEditTeamPM(?)', [idEquipo]);
        const equipo = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
        res.send(equipo);
    } catch(err){
        console.error(err);
    }
    
})

module.exports = router;

