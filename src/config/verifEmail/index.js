const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()

const verifEmail = (name, email) => {
    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            type: 'OAuth2',
            user : 'agaf212@gmail.com',
            clientId : process.env.CLIENT_ID,
            clientSecret : process.env.CLIENT_TOKEN,
            refreshToken : process.env.REFRESH_TOKEN
        }
    })


// mail content
const mail = { 
    from : 'masak-masakan <masakdewek@gmail.com',
    to : email,
    subject : 'Verify User',
    html : `<h1>halo, ${name}</h1>
            <p>Selamat datang</p>`
}

// send Email
transporter.sendMail(mail,(err, result) => {
    if(err) return console.log({error: err.message})
    console.log('terkirim');
    
    
})
}
module.exports = verifEmail
