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