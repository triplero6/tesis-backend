DELIMITER $$
CREATE PROCEDURE spLogIn(
	IN	inUsername VARCHAR(45)
)
BEGIN
	SELECT Usuarios.idUsuario,
    Usuarios.Nombre,
    Usuarios.Apellido,
    Usuarios.FotoPerfil,
    UsuariosEnGrupos.Rol FROM Usuarios JOIN UsuariosEnGrupos 
    ON Usuarios.idUsuario = UsuariosEnGrupos.idUsuario 
    WHERE Usuarios.username = inUsername AND UsuariosEnGrupos.idGrupo = 1; 
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spRegister(
	IN	inUsername VARCHAR(45),
    IN  inMail VARCHAR(45)
)
BEGIN
	SELECT * FROM Usuarios WHERE username = inUsername OR Mail = inMail; 
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeserializeUser(
    IN inIdUsuario INT
)
BEGIN
    SELECT * FROM Usuarios WHERE IdUsuario = inIdUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditUser(
    IN inIdUsuario INT,
    IN inNombre VARCHAR(45),
    IN inApellido VARCHAR(45),
    IN inFotoPerfil VARCHAR(200),
    IN inMail VARCHAR(45)
)
BEGIN 
    UPDATE Usuarios SET Nombre=inNombre, Apellido=inApellido, FotoPerfil=inFotoPerfil, Mail=inMail WHERE idUsuario=inIdUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditGroup(
    IN inIdGroup INT,
    IN inNombreGrupo VARCHAR(45),
    IN inFechaFundacion DATETIME,
    IN inApostolado VARCHAR(45),
    IN inDescripcion TEXT,
    IN inImagen VARCHAR(200)
)
BEGIN 
    UPDATE Grupos SET NombreGrupo=inNombreGrupo, FechaFundacion=inFechaFundacion, Apostolado=inApostolado, Descripcion=inDescripcion, Imagen=inImagen WHERE idGrupo=inIdGroup;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditUserPhoto(
    IN inidUsuario INT,
    IN inFotoPerfil VARCHAR(200)
)
BEGIN
    UPDATE Usuarios SET FotoPerfil=inFotoPerfil WHERE idUsuario=inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spSearchByMail(
    IN inMail VARCHAR(45)
)
BEGIN 
    SELECT idUsuario FROM Usuarios WHERE Mail = inMail;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spChangePassword(
    IN inIdUsuario INT,
    IN inNewPassword VARCHAR(200)
)
BEGIN 
    UPDATE Usuarios SET Contrasenia=inNewPassword WHERE idUsuario=inIdUsuario;
END $$
DELIMITER;

DELIMITER $$
CREATE PROCEDURE spUserPassword(
    IN inidUsuario  INT
)
BEGIN
    SELECT Contrasenia FROM Usuarios WHERE idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListUsers()
BEGIN
    SELECT idUsuario, Nombre, Apellido FROM Usuarios;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListEquipos()
BEGIN
    SELECT Equipos.idEquipo, Equipos.Descripcion, TipoEquipo.Nombre as Tipo, Equipos.Anio, TipoEquipo.EstadoEquipo FROM Equipos INNER JOIN TipoEquipo WHERE Equipos.idTipoEquipo = TipoEquipo.idTipoEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListSolicitudes()
BEGIN
    SELECT username, Nombre, Apellido, Mail FROM Usuarios WHERE EstadoUsuario = 0;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListUsuarios()
BEGIN 
    SELECT Usuarios.idUsuario,
    Usuarios.Nombre, 
    Usuarios.Apellido, 
    Usuarios.username, 
    Usuarios.Mail, 
    Usuarios.PM , 
    Grupos.NombreGrupo, 
    Usuarios.EstadoUsuario 
    FROM Usuarios JOIN UsuariosEnGrupos ON Usuarios.idUsuario =  UsuariosEnGrupos.idUsuario
    JOIN Grupos ON UsuariosEnGrupos.idGrupo = Grupos.idGrupo;
END $$
DELIMITER;

DELIMITER $$
CREATE PROCEDURE spDisabledUser(
    IN inidUsuario INT
)
BEGIN 
    UPDATE Usuarios SET EstadoUsuario=2 WHERE idUsuario=inidUsuario;
END $$
DELIMITER ;


DELIMITER $$ 
CREATE PROCEDURE spListGrupos()
BEGIN
    SELECT NombreGrupo, FechaFundacion, Apostolado, Descripcion FROM Grupos;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddGroup(
    IN inidTipoGrupo INT,
    IN inNombreGrupo VARCHAR(45),
    IN inFechaFundacion DATETIME,
    IN inApostolado VARCHAR(45),
    IN inDescripcion TEXT
)
BEGIN
    INSERT INTO Grupos(idTipoGrupo, NombreGrupo, FechaFundacion, Apostolado, Descripcion) VALUES ( inidTipoGrupo, inNombreGrupo, inFechaFundacion, inApostolado, inDescripcion);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteGroup(
    IN inidGrupo INT
)
BEGIN
    DELETE FROM Grupos WHERE idGrupo = inidGrupo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddTeam(
    IN inidTipoEquipo INT,
    IN inDescripcion VARCHAR(45),
    IN inAnio INT,
    OUT out_param INT
)
BEGIN
    INSERT INTO Equipos(idTipoEquipo, Descripcion, Anio) VALUES ( inidTipoEquipo, inDescripcion, inAnio);
    SET out_param = LAST_INSERT_ID();
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddTeamPM(
    IN inidEquipo INT,
    IN inidAsesor INT,
    IN inNumero INT,
    IN inLugar VARCHAR(100),
    IN inNombreCasa VARCHAR(100),
    IN inidEquipoCocina INT,
    IN inSexo ENUM('Femenino', 'Masculino')
)
BEGIN
    INSERT INTO EquiposPM(idEquipo, idAsesor, Numero, Lugar, NombreCasa, idEquipoCocina, Sexo) VALUES ( inidEquipo, inidAsesor, inNumero, inLugar, inNombreCasa, inidEquipoCocina, inSexo);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddFile(
    IN inidUsuario INT,
    IN inNombre VARCHAR(45),
    IN inTipo VARCHAR(45)
    IN inExtension VARCHAR(45),
    IN inNombreSubida VARCHAR(200)
)
BEGIN
    INSERT INTO Archivos(idUsuario, Nombre, Tipo, Extension, NombreSubida) VALUES ( inidUsuario, inNombre, inTipo, inExtension, inNombreSubida);
END $$
DELIMITER ;

DELIMITER $$ 
CREATE PROCEDURE spListArchivos()
BEGIN
    SELECT Archivos.Nombre, Archivos.FechaSubida, Archivos.Tipo, Archivos.Extension, Archivos.NombreSubida, CONCAT_WS(', ', Usuarios.Apellido, Usuarios.Nombre) AS 'Usuario' FROM Archivos INNER JOIN Usuarios WHERE Archivos.idUsuario = Usuarios.idUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListAsesores()
BEGIN
    SELECT idAsesor, CONCAT_WS(', ', Apellido, Nombre) AS Nombre FROM Asesores;
END $$
DELIMITER ;
 
DELIMITER $$
CREATE PROCEDURE spDeleteArchivos(
    IN inidArchivo INT
)
BEGIN
    DELETE FROM Archivos WHERE idArchivo = inidArchivo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEnabledUser(
    IN inidUsuario INT
)
BEGIN
    UPDATE Usuarios SET EstadoUsuario=1 WHERE idUsuario=inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spUserProfile(
    IN inidUsuario INT
)
BEGIN 
    SELECT Usuarios.idUsuario,
    Usuarios.Nombre, 
    Usuarios.Apellido, 
    Usuarios.username, 
    Usuarios.Mail, 
    Usuarios.PM , 
    Grupos.NombreGrupo
    FROM Usuarios JOIN UsuariosEnGrupos ON Usuarios.idUsuario =  UsuariosEnGrupos.idUsuario
    JOIN Grupos ON UsuariosEnGrupos.idGrupo = Grupos.idGrupo WHERE Usuarios.idUsuario = inidUsuario;
END $$
DELIMITER;

DELIMITER $$
CREATE PROCEDURE spPublicacionesMovimiento()
BEGIN
    SELECT Publicaciones.idPublicacion,
    Publicaciones.Titulo, 
    Publicaciones.Cuerpo, 
    Publicaciones.FechaPublicacion, 
    CONCAT_WS(', ', Usuarios.Apellido, Usuarios.Nombre) AS 'Redactado', 
    Usuarios.FotoPerfil FROM Publicaciones JOIN Usuarios 
    ON Publicaciones.idUsuario = Usuarios.idUsuario 
    WHERE Publicaciones.EstadoPublicacion=1;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spComentarioPublicacion(
    IN inidPublicacion INT
)
BEGIN 
SELECT CONCAT_WS(', ', Usuarios.Apellido, Usuarios.Nombre) AS 'Redactado', 
    Usuarios.FotoPerfil,
    Comentarios.Contenido, 
    Comentarios.FechaComentario FROM Usuarios JOIN Comentarios ON
    Comentarios.idUsuario = Usuarios.idUsuario
     WHERE Comentarios.idPublicacion = inidPublicacion;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddPublication(
    IN in VARCHAR(45),
    IN inTipo VARCHAR(45)
    IN inExtension VARCHAR(45),
    IN inNombreSubida VARCHAR(200)
)
BEGIN
    INSERT INTO Archivos(idUsuario, Nombre, Tipo, Extension, NombreSubida) VALUES ( inidUsuario, inNombre, inTipo, inExtension, inNombreSubida);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spPublicaciones()
BEGIN
SELECT Publicaciones.idPublicacion,
Publicaciones.idGrupo,
Publicaciones.Destino, 
Publicaciones.Titulo, 
Publicaciones.Cuerpo, 
Publicaciones.FechaPublicacion, 
Publicaciones.EstadoPublicacion, 
CONCAT_WS(', ', Usuarios.Apellido, Usuarios.Nombre) AS 'Redactado' 
FROM Publicaciones JOIN Usuarios ON Publicaciones.idUsuario = Usuarios.idUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddPublicacion(
        IN inidGrupo INT,
        IN ininUsuario INT, 
        IN inTitulo VARCHAR(120),
        IN inCuerpo TEXT,
        IN inEstadoPublicacion TINYINT,
        IN inFechaPublicacion DATE TIME,
        IN inTipo ENUM('Publicacion','Novedad'),
        IN inDestino ENUM('Principal','Comunidad','Comision')
)
BEGIN
INSERT INTO Publicaciones(
    idGrupo,
    idUsuario, 
    Titulo, 
    Cuerpo, 
    EstadoPublicacion, 
    FechaPublicacion,
    Tipo,
    Destino) 
VALUES ( 
    inidGrupo,
    inidUsuario, 
    inTitulo, 
    inCuerpo, 
    inEstadoPublicacion,
    inFechaFundacion,
    inTipo,
    inDestino
);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddNovedad(
        IN ininUsuario INT, 
        IN inTitulo VARCHAR(120),
        IN inCuerpo TEXT,
        IN inFoto VARCHAR(200),
        IN inEstadoPublicacion TINYINT,
        IN inFechaPublicacion DATE TIME
)
BEGIN
INSERT INTO Publicaciones(
    idGrupo,
    idUsuario, 
    Titulo, 
    Cuerpo,
    Foto, 
    EstadoPublicacion, 
    FechaPublicacion,
    Tipo,
    Destino) 
VALUES ( 
    1,
    inidUsuario, 
    inTitulo, 
    inCuerpo,
    inFoto, 
    inEstadoPublicacion,
    inFechaFundacion,
    'Novedad',
    'Principal'
);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spActivatePublicacion(
    IN inidPublicacion INT
)
BEGIN 
    UPDATE Publicaciones SET EstadoPublicacion=1 WHERE idPublicacion=inidPublicacion;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeactivatePublicacion(
    IN inidPublicacion INT
)
BEGIN 
    UPDATE Publicaciones SET EstadoPublicacion=2 WHERE idPublicacion=inidPublicacion;
END $$
DELIMITER ;


DELIMITER $$
CREATE DEFINER=`calvarez`@`%` PROCEDURE `spInsertUser`(
	IN	inNombre VARCHAR(45),
    IN	inApellido VARCHAR (45),
    IN 	inContrasenia VARCHAR (120),
    IN 	inEstadoUsuario tinyint,
    IN 	inPM	INT,
    IN	inMail VARCHAR(45),
    IN	inusername VARCHAR (50),
    OUT estado tinyint,
    OUT out_id BIGINT
)
BEGIN
	IF (SELECT COUNT(*) FROM Usuarios WHERE username=inusername OR Mail=inMail) >= 1 THEN 
		SELECT 0 INTO estado;
	ELSE
		INSERT INTO Usuarios (Nombre, Apellido, Contrasenia, EstadoUsuario, PM, Mail, username) VALUES (inNombre, inApellido, inContrasenia, inEstadoUsuario, inPM, inMail, inusername);
		SELECT 1 INTO estado;
        SET out_id = LAST_INSERT_ID();
    	END IF;    
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spUserInGroup(
    IN inidUsuario INT,
    IN inNombreGrupo VARCHAR(45)
)
BEGIN 
    SELECT idGrupo INTO @Grupo FROM Grupos WHERE NombreGrupo = inNombreGrupo;
    INSERT INTO UsuariosEnGrupos (idGrupo, idUsuario, Rol, FechaDesde) VALUES(@Grupo, inidUsuario, 'Integrante', NOW());
END
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListHomeNovedades()
BEGIN  
    SELECT * FROM(
        SELECT  idPublicacion, Titulo, Cuerpo, Foto, FechaPublicacion FROM Publicaciones WHERE Tipo = 'Novedad' AND EstadoPublicacion = 1
        ORDER BY idPublicacion DESC LIMIT 4
    )Home ORDER BY idPublicacion ASC;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListNovedades()
BEGIN  
    SELECT * FROM(
        SELECT  idPublicacion, Titulo, Cuerpo, Foto, FechaPublicacion FROM Publicaciones WHERE Tipo = 'Novedad' AND EstadoPublicacion = 1;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAsesores()
BEGIN
    SELECT idAsesor,CONCAT_WS(', ', Apellido, Nombre)AS Asesor FROM Asesores;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListRol(
    IN inRol ENUM('Coordinador', 
    'Vocal FE', 
    'Vocal Proceso Educativo',
    'Vocal Pastoral', 
    'Vocal Retaguardia', 
    'Vocal Etapa Joven', 
    'Vocal Etapa Joven Adulto y Adulto', 
    'Asesor Espiritual', 
    'Asesor Laico', 
    'Integrante'),
    IN inidGrupo INT
)
BEGIN 
    SELECT * FROM UsuariosEnGrupos WHERE Rol=inRol AND idGrupo = inidGrupo AND FechaHasta = null;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeletePublication(
    IN inidPublicacion INT
)
BEGIN 
    DELETE FROM Publicaciones WHERE idPublicacion = inidPublicacion;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteUser(
    IN inidUsuario INT
)
BEGIN 
    DELETE FROM UsuariosEnGrupos WHERE idUsuario = inidUsuario;
    DELETE FROM Usuarios WHERE idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteUsersTeams(
    IN inidEquipo INT
)
BEGIN
    DELETE FROM UsuariosEnEquipos WHERE idEquipo = inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteTeamPM(
    IN inidEquipo INT
)
BEGIN 
    DELETE FROM EquipoPM WHERE idEquipo = inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteTeam(
    IN inidEquipo INT
)
BEGIN 
    DELETE FROM Equipos WHERE idEquipo = inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spGetPublicacion(
    IN inidPublicacion INT
)
BEGIN
    SELECT Titulo, Subtitulo, FechaPublicacion, Foto, Cuerpo 
    FROM Publicaciones WHERE idPublicacion = inidPublicacion;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spGetEditTeam(
    IN inidEquipo INT
)
BEGIN
    SELECT idEquipo, Descripcion, idTipoEquipo, Anio FROM Equipos WHERE idEquipo = inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spGetEditTeamPM(
    IN inidEquipo INT
)
BEGIN  
    SELECT Equipos.idEquipo, Equipos.Descripcion, Equipos.Anio,
    EquipoPM.Numero, EquipoPM.Lugar, EquipoPM.NombreCasa, EquipoPM.Sexo, 
    CONCAT_WS(', ', Asesores.Apellido, Asesores.Nombre) AS 'Asesor'
    FROM Equipos JOIN EquipoPM ON Equipos.idEquipo = EquipoPM.idEquipo JOIN Asesores ON EquipoPM.idAsesor = Asesores.idAsesor
    WHERE Equipos.idEquipo = inidEquipo ;
END $$
DELIMITER ;

DELIMITER $$ 
CREATE PROCEDURE spGetRolDirigente(
    IN inidUsuario INT
)
BEGIN  
    SELECT te.Nombre, epm.Numero, ue.Rol, ue.FechaDesde, ue.FechaHasta 
    FROM Equipos e LEFT JOIN EquipoPM epm ON e.idEquipo = epm.idEquipo JOIN UsuariosEnEquipos ue ON e.idEquipo = ue.idEquipo 
    JOIN TipoEquipo te ON e.idTipoEquipo = te.idTipoEquipo WHERE ue.idUsuario = inidUsuario; 
END $$
DELIMITER;

DELIMITER $$
CREATE PROCEDURE spGetTeamMembers(
    IN  inidEquipo INT
)
BEGIN
    SELECT u.idUsuario, e.idEquipo, concat_ws(', ', u.Apellido, u.Nombre) AS Dirigente,  ue.Rol 
    FROM Equipos e JOIN UsuariosEnEquipos ue ON e.idEquipo = ue.idEquipo JOIN Usuarios u ON u.idUsuario = ue.idUsuario
    WHERE e.idEquipo = inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditTeamPM(
    IN inidEquipo INT,
    IN inLugar VARCHAR(100),
    IN inNombreCasa VARCHAR(100),
    IN inidAsesor INT
)
BEGIN 
    UPDATE EquipoPM SET Lugar = inLugar, NombreCasa = inNombreCasa, idAsesor = inidAsesor;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditTeam(
    IN inidEquipo INT,
    IN inDescripcion TEXT
)
BEGIN
    UPDATE Equipos SET Descripcion = inDescripcion WHERE idEquipo = inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddUserInTeam(
    IN inidUsuario INT,
    IN inidEquipo INT,
    IN inRol ENUM('Consejero','Director','Asistente Tecnico','Asesor','Encargado','Integrante'),
    IN inFechaDesde DATE,
    IN inFechaHasta DATE
)
BEGIN
    INSERT INTO UsuariosEnEquipos(idUsuario, idEquipo, Rol, FechaDesde, FechaHasta) VALUES ( inidUsuario, inidEquipo, inRol, inFechaDesde, inFechaHasta);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spSelectEditTeam(
    IN inidEquipo INT
)
BEGIN
    SELECT Usuarios.idUsuario,
    Usuarios.Nombre, 
    Usuarios.Apellido, 
    Usuarios.username, 
    Usuarios.Mail, 
    Usuarios.PM , 
    Equipos.idEquipo, 
    Usuarios.EstadoUsuario 
    FROM Usuarios LEFT JOIN UsuariosEnEquipos ON Usuarios.idUsuario =  UsuariosEnEquipos.idUsuario
    LEFT JOIN Equipos ON UsuariosEnEquipos.idEquipo = Equipos.idEquipo WHERE Equipos.idEquipo != inidEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListComisiones()
BEGIN 
    SELECT g.idGrupo, g.NombreGrupo FROM Grupos g JOIN TipoGrupos tg ON g.idTipoGrupo = tg.idTipoGrupo WHERE tg.idTipoGrupo = 4;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spUserComision(
    IN inidUsuario INT
)
BEGIN
    SELECT g.NombreGrupo FROM Usuarios u JOIN UsuariosEnGrupos ue ON u.idUsuario = ue.idUsuario 
    JOIN Grupos g ON ue.idGrupo = g.idGrupo JOIN TipoGrupos tg ON g.idTipoGrupo = tg.idTipoGrupo  
    WHERE ue.idGrupo != 1 AND tg.idTipoGrupo = 4 AND u.idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddComision(
    IN inidUsuario INT,
    IN inidComision INT,
    IN inRol ENUM('Coordinador', 
    'Vocal FE', 
    'Vocal Proceso Educativo',
    'Vocal Pastoral', 
    'Vocal Retaguardia', 
    'Vocal Etapa Joven', 
    'Vocal Etapa Joven Adulto y Adulto', 
    'Asesor Espiritual', 
    'Asesor Laico', 
    'Integrante')
)
BEGIN
    INSERT INTO UsuariosEnGrupos (idGrupo, idUsuario, Rol, FechaDesde) VALUES (inidComision, inidUsuario, inRol, CURDATE());
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteComision(
    IN inidUsuario INT,
    IN inidComision INT
)
BEGIN DELETE FROM UsuariosEnGrupos ug JOIN Grupos g WHERE ug.idUsuario = inidUsuario AND FechaHasta IS NULL AND ug.idGrupo = inidComision;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEndComision(
    IN inidUsuario INT,
    IN inidComision INT
)
BEGIN
    UPDATE UsuariosEnGrupos ug SET FechaHasta = CURDATE() WHERE ug.idUsuario = inidUsuario AND FechaHasta IS NULL AND ug.idGrupo = inidComision;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spPublicacionesComunidad(
    IN inidGrupo INT
)
BEGIN 
    SELECT Publicaciones.idPublicacion,
    Publicaciones.idGrupo,
    Publicaciones.Destino, 
    Publicaciones.Titulo, 
    Publicaciones.Cuerpo, 
    Publicaciones.FechaPublicacion, 
    Publicaciones.EstadoPublicacion, 
    CONCAT_WS(', ', Usuarios.Apellido, Usuarios.Nombre) AS 'Redactado' 
    FROM Publicaciones JOIN Usuarios ON Publicaciones.idUsuario = Usuarios.idUsuario WHERE Publicaciones.idGrupo = inidGrupo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spLogInComunidad(
    IN inidUsuario INT
)
BEGIN
SELECT g.idGrupo, g.NombreGrupo FROM Usuarios u JOIN UsuariosEnGrupos ug ON u.idUsuario = ug.idUsuario JOIN Grupos g ON ug.idGrupo = g.idGrupo 
WHERE (g.idTipoGrupo = 1 OR g.idTipoGrupo = 2 OR g.idTipoGrupo = 3) AND ug.FechaHasta IS NULL AND u.idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spLogInComision(
    IN inidUsuario INT
)
BEGIN
SELECT g.idGrupo, g.NombreGrupo FROM Usuarios u JOIN UsuariosEnGrupos ug ON u.idUsuario = ug.idUsuario JOIN Grupos g ON ug.idGrupo = g.idGrupo 
WHERE g.idTipoGrupo = 4 AND ug.FechaHasta IS NULL AND u.idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddComment(
    IN inidUsuario INT,
    IN inidPublicacion INT, 
    IN inContenido TEXT
)
BEGIN
    INSERT INTO Comentarios (idUsuario, idPublicacion, Contenido) VALUES (inidUsuario, inidPublicacion, inContenido);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spDeleteComment(
    IN inidComentario INT
)
BEGIN
    DELETE FROM Comentarios WHERE idComentario = inidComentario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditPublicacion(
    IN inidPublicacion INT,
    IN inTitulo VARCHAR(120),
    IN inCuerpo TEXT
)
BEGIN
    UPDATE Publicaciones SET Titulo = inTitulo, Cuerpo = inCuerpo 
    WHERE idPublicacion = inidPublicacion;
END $$
DELIMITER ; 

DELIMITER $$
CREATE PROCEDURE spGetEditPublicacion(
    IN inidPublicacion INT
)
BEGIN
    SELECT Titulo, Cuerpo FROM Publicaciones WHERE idPublicacion = inidPublicacion;
END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE spGetEditGrupo(
    IN inidGrupo INT
)
BEGIN
    SELECT NombreGrupo, FechaFundacion, Apostolado, Descripcion FROM Grupo WHERE idGrupo = inidGrupo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditGrupo(
    IN inidGrupo INT,
    IN inidTipoGrupo INT,
    IN inApostolado VARCHAR (200),
    IN inDescripcion TEXT,
    IN inImagen VARCHAR(200)
)
    UPDATE Grupos SET idTipoGrupo = inidTipoGrupo, Apostolado = inApostolado,
    Descripcion = inDescripcion, Imagen = inImagen;
END $$
DELIMITER ;

DELIMTER $$
CREATE PROCEDURE spForgetPassword(
    IN inMail VARCHAR(45) 
)
BEGIN
    SELECT idUsuario, CONCAT_WS(', ', Apellido, Nombre) AS Nombre FROM Usuarios WHERE Mail = inMail;
END $$
DELIMITER;

DELIMITER $$
CREATE PROCEDURE spResetPasswordLink(
    IN inResetPasswordLink VARCHAR(200) 
)
BEGIN
    SELECT idUsuario, CONCAT_WS(', ', Apellido, Nombre) AS Nombre FROM Usuarios WHERE ResetPasswordLink = inResetPasswordLink;
END $$
DELIMITER;

DELIMITER $$
CREATE PROCEDURE spAddResetPasswordLink(
    IN inidUsuario INT,
    IN inResetPasswordLink VARCHAR(200)
)
BEGIN
    UPDATE Usuarios SET ResetPasswordLink = inResetPasswordLink WHERE idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spResetPassword(
    IN inidUsuario INT,
    IN inNewPassword VARCHAR(200)
)
BEGIN 
    UPDATE Usuarios SET Contrasenia = inNewPassword WHERE idUsuario = inidUsuario;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spListComunidades()
BEGIN 
    SELECT idGrupo, NombreGrupo FROM Grupos WHERE idTipoGrupo = 1 OR idTipoGrupo = 2 OR idTipoGrupo = 3;
END $$
DELIMTER ;

DELIMITER $$
CREATE PROCEDURE spGetGrupo(
    IN inidGrupo INT
)
BEGIN
    SELECT idGrupo, NombreGrupo, Imagen FROM Grupos WHERE idGrupo = inidGrupo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spAddEvaluationTeam(
    IN inidEquipo INT,
    IN inidTipoEquipo INT,
    IN inFichaEvaluacion VARCHAR(200)
)
BEGIN
    INSERT INTO EvaluacionesDeEquipos(idEquipo, idTipoEquipo, FechaEvaluacion, FichaEvaluacion)
    VALUES (inidEquipo, inidTipoEquipo, CURDATE(), inFichaEvaluacion);
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spEditEvaluationTeam(
    IN inidEvaluacionEquipo INT,
    IN inFichaEvaluacion VARCHAR(200)
)
BEGIN
    UPDATE EvaluacionesDeEquipos SET FichaEvaluacion = inFichaEvaluacion, FechaEvaluacion = CURDATE() 
    WHERE idEvaluacionEquipo = inidEvaluacionEquipo;
END $$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE spRolGeneral(
    IN inidUsuario INT
)
BEGIN
    SELECT * FROM UsuariosEnGrupos WHERE idUsuario = inidUsuario AND idGrupo = 1;
END $$
DELIMITER ;