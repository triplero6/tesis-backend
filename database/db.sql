DELIMITER $$
CREATE PROCEDURE spLogIn(
	IN	inUsername VARCHAR(45)
)
BEGIN
	SELECT * FROM Usuarios WHERE username = inUsername; 
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
    UPDATE Usuarios SET EstadoUsuario=0 WHERE idUsuario=inidUsuario;
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