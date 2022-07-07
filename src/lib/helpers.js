const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const moment = require('moment');


const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

helpers.matchPassword = async (password, savedPassword) => {
    try{
        return await bcrypt.compare(password, savedPassword);
    } catch(e) {
        console.log(e);
    }
};

helpers.formatSQL = (date) => {
    const fechaformat = moment(
        date,
        "YYYY-MM-DDTHH:mm:ss"
    );
    return newdate = fechaformat.format("YYYY-MM-DD");
}

helpers.sendWelcomeMail = async (mail) => {

    contentHTML = `
        <h1>Hola</h1>
        <p>Te has registrado dentro de MiPalestra</br>
        Espera que los administradores permitan tu acceso a la app para empezar a disfrutarla
        </p>
    `;


    let transporter = nodemailer.createTransport({
        host: 'mail.palestra.com.ar',
        port: 25,
        secure: false,
        auth: {
            user: 'info@palestra.com.ar',
            pass: 'triplero6'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let info = await transporter.sendMail({
        from: '"Info Palestra" <info@palestra.com.ar>', // sender address,
        to: mail,
        subject: 'Website Contact Form',
        // text: 'Hello World'
        html: contentHTML
    });
    console.log('Message sent: %s', info.messageId);


}

helpers.resetPasswordMail = async (mail, token) => {

    contentHTML = `
        <h1>Usa el siguiente enlace para cambiar tu contraseña</h1>
        <p><a href="${process.env.CLIENT_URL}/password/reset/${token}"><<h3>Cambiar tu contraseña</h3></a></br>
        No compartas este mail, ya que contiene informacion sensible.
        </p>
    `;
    let transporter = nodemailer.createTransport({
        host: 'mail.palestra.com.ar',
        port: 25,
        secure: false,
        auth: {
            user: 'info@palestra.com.ar',
            pass: 'triplero6'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    let info = await transporter.sendMail({
        from: '"MiPalestra" <info@palestra.com.ar>', // sender address,
        to: mail,
        subject: 'Reestablecer contraseña',
        // text: 'Hello World'
        html: contentHTML
    });
    console.log('Message sent: %s', info.messageId);
}


module.exports = helpers;