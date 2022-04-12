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
                                        res.send('Algo salio mal')
                                    })
                                } else {
                                    connection.commit(function(err){np
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

router.put('/edit', (req, res) => {

});

module.exports = router;

