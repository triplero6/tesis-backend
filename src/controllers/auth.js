const { validationResult } = require('express-validator');
const  expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const pool = require('../database');
const helpers = require('../lib/helpers');
const { connect } = require('../routes');
const { query } = require('express');



exports.registerController = async (req, res) => {
  console.log(req.body)
  const { Nombre, Apellido, username, Contrasenia, Mail, PM, Comunidad } = req.body;
  const errors = validationResult(req);
  const Cifrada = await helpers.encryptPassword(Contrasenia);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } 
    try{
      const rows = await pool.query('CALL MiPalestra.spRegister(?,?)', [username, Mail]);
      if (rows[0].length > 0) {
        return res.status(400).json({
          errors: 'Ya existe usuario o Mail dentro de la base de datos'
        });
      } else{
        try{
          pool.getConnection(function(err, connection){
            connection.beginTransaction(function(err){
              if(err){
                connection.rollback(function(){
                  connection.release();
                });
              }else{

                connection.query('CALL MiPalestra.spInsertUser(?,?,?,?,?,?,?,@estado, @out_id); SELECT @estado AS estado; SELECT @out_id AS insertId', 
                [Nombre, Apellido, Cifrada, 0,PM, Mail, username], function(err, rows) {
                  if (err) {          //Query Error (Rollback and release connection)
                      connection.rollback(function() {
                          connection.release();
                          console.log(err);
                          //Failure
                      })
                  } else{
                    const insertId =  Object.values(JSON.parse(JSON.stringify(rows)))[2][0].insertId;
                    connection.query("CALL MiPalestra.spUserInGroup(?,?);CALL MiPalestra.spUserInGroup(?,1);", 
                    [insertId, Comunidad, insertId],
                    function(err, rows){
                      if(err){
                        console.log('llega aca 1', err)
                        connection.rollback(function(){
                          connection.release();
                          return res.status(400).json({
                            errors: 'Algo salio mal'
                          });
                        })
                      } else {
                        connection.commit(function(err){
                          if(err){
                            console.log('llega aca 2')
                            connection.rollback(function(){
                              connection.release();
                              return res.status(400).json({
                                errors: 'Algo salio mal'
                              });
                            })
                          }else{
                            connection.release();
                            res.send('Usuario agregado');
                            helpers.sendWelcomeMail(Mail);
                        }
                        })
                      }
                    })
                  }
                });
                
              }
            })
          })
        } catch(err){
          console.err(err);
        }
      }
    } catch(err){
      console.error(err);
    }
  
  
};

exports.activationController = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        console.log('Activation error');
        return res.status(401).json({
          errors: 'Expired link. Signup again'
        });
      } else {
        const { name, email, password } = jwt.decode(token);

        console.log(email);
        const user = new User({
          name,
          email,
          password
        });

        user.save((err, user) => {
          if (err) {
            console.log('Save error', errorHandler(err));
            return res.status(401).json({
              errors: errorHandler(err)
            });
          } else {
            return res.json({
              success: true,
              message: user,
              message: 'Signup success'
            });
          }
        });
      }
    });
  } else {
    return res.json({
      message: 'error happening please try again'
    });
  }
};

exports.signinController = async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  }
    // check if user exist
    try{
      const rows = await pool.query('CALL MiPalestra.spLogIn(?)', [username]);
      if(rows[0].length > 0){
          const user = rows[0][0];
          if(user.EstadoUsuario !== 1){
            console.log(user.EstadoUsuario)
            return res.status(422).json({
              errors: 'El usuario no esta activo en el sistema'
            });
          }
          const validPassword = await helpers.matchPassword(password, user.Contrasenia); 
          console.log(validPassword)         
          if(validPassword){
            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
            const { idUsuario, Nombre, Apellido, FotoPerfil, Rol } = user;
            const rows1 = await pool.query('CALL MiPalestra.spLogInComunidad(?)', [idUsuario]);
            const comunidad = rows1[0][0];
            const idComunidad = comunidad.idGrupo;
            const NombreComunidad = comunidad.NombreGrupo;
            const rows2 = await pool.query('CALL MiPalestra.spLogInComision(?)', [idUsuario]);
            const comision = rows2[0][0];
            if(comision){
              const idComision = comision.idGrupo;
              const NombreComision = comision.NombreGrupo;
              return res.json({token, user: { idUsuario, Nombre, Apellido, FotoPerfil, Rol}, comunidad: {idComunidad, NombreComunidad}, comision: {idComision, NombreComision}});
            }else{
              return res.json({token, user: { idUsuario, Nombre, Apellido, FotoPerfil, Rol}, comunidad: {idComunidad, NombreComunidad}, comision: {idComision: 0, NombreComision: 'Sin comision'}});
            }
    
          }else {
            return res.status(400).json({
            errors: 'El usuario o la contraseña no coincide'
          });
          }

      } else {
        return res.status(400).json({
          errors: 'El usuario no existe'
        });
      }
    } catch (err){
      console.log(err);
      return res.status(400).json({
        errors: err
      });
      
    }
};

exports.requireSignin = expressJwt({
  secret: 'process.env.JWT_SECRET '// req.user._id
});

exports.adminMiddleware = (req, res, next) => {
  User.findById({
    _id: req.user._id
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    if (user.role !== 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.'
      });
    }

    req.profile = user;
    next();
  });
};

exports.forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  const errors = validationResult(req);
  console.log(email);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    try{
      const row = await pool.query('CALL MiPalestra.spForgetPassword(?)', [email]);
      const user = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
      if(user){
        const token = jwt.sign(
          {
            _id: user.idUsuario
          },
          process.env.JWT_RESET_PASSWORD,
          {
            expiresIn: '30m'
          }
        );
        await pool.query('CALL MiPalestra.spAddResetPasswordLink(?,?)', [user.idUsuario, token]);
        helpers.resetPasswordMail(email, token, user.Nombre);
        res.json({
          message: `Se envio un correo a ${email}, con las instrucciones para cambiar la contraseña`
        });

      } else {
        return res.status(400).json({
          error: 'No existe un usuario con esa dirección de Correo'
        });
      }
    } catch(err){
      console.log('Error al recuperar contraseña', err);
      return res.status(422).json({
        errors: 'Error al recuperar contraseña'
      })
    }}
};

exports.resetPasswordController = async (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  console.log(resetPasswordLink, newPassword)

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    const firstError = errors.array().map(error => error.msg)[0];
    return res.status(422).json({
      errors: firstError
    });
  } else {
    if (resetPasswordLink) {
      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(
        err,
        decoded
      ) {
        if (err) {
          return res.status(400).json({
            error: 'Expired link. Try again'
          });
        }
      })
    }    
    try{
        const row = await pool.query('CALL MiPalestra.spResetPasswordLink(?)', [resetPasswordLink]);
        const user = Object.values(JSON.parse(JSON.stringify(row)))[0][0];
        if(user){
          const resetPassword = await helpers.encryptPassword(newPassword)
          console.log(resetPassword)
          await pool.query('CALL MiPalestra.spResetPassword(?,?)', [user.idUsuario, resetPassword]);
          res.json({
            message: `Se reseteo correctamente la contraseña de ${user.Nombre}`
          });
        } else{
          res.status(422).json({
            errors: 'No existe un usuario asociado a ese link.'
          });
        }
    } catch (err){
      console.log('Error en Reset Password Link', err);
      res.status(422).json({
        errors: 'Error en link de reset'
      });
    }    
  }};

