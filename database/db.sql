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
