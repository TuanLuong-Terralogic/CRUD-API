const Datauri = require('datauri');
const path = require('path');

const cloudinary = require('../config/cloudinay');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const uploader = req => {
    return new Promise((resolve, reject) => {
        const dUri = new Datauri();
        let image = dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);

        cloudinary.uploader.upload(image.content, (err, url) => {
            if(err) return reject(err);
            return resolve(url);
        })
    });
}

const sendEmail = mailOption => {
    return new Promise((resolve, reject) => {
        sgMail.send(mailOption, (error, result) => {
            if(error) return reject(error);
            return resolve(result);
        });
    });
}

module.exports = { uploader, sendEmail };