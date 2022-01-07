const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');



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

module.exports = helpers;