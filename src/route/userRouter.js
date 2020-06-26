const jwt = require('../config/token')
const conn = require('../config/database')
const router = require('express').Router()
const verifEmail = require('../config/verifEmail')
const bycrpt = require('bcrypt')
const validator = require('validator')
const auth = require('../config/auth')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')

const upload = multer({
    limits: {
        fileSize: 10000000 // Byte , default 1MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
        }
 
        cb(undefined, true)
    }
 })
 
 const filesDirectory = path.join(__dirname, '../ProfilePicture')

//  User Registrasi
router.post('/register',(req,res) => {
    // req.body = {username, name, email, password} 

    const sql = `insert into users set?`
    const data = req.body

    // format email
    let checkEmail = validator.isEmail(data.email)
    if(!checkEmail) return res.send('email tidak sesuai')

    // hash password
    data.password = bycrpt.hashSync(data.password, 8)

    conn.query(sql, data, (err, result) => {
        if(err) return res.send(err)

        // kirim email verif
        verifEmail(data.name, data.email, result.insertId)

        res.send({
            message: 'Register Berhasil',
            result: result
        })
    })
})

// User verifikasi
router.get('/verify/:userid',  (req, res) =>{
    const sql = `update users set verified = true where id = ${req.params.userid}`
  
    conn.query(sql, (err, result) => {
        if(err) return res.send(err.sqlMessage)
        res.send(`<h1>berhasil verifikasi</h1>`)
    })
})

// User Login
router.post('/user/login', (req, res) => {
    const {username, password} = req.body
    const sql = `select * from users where username = '${username}'`
    const sql2 = `insert into tokens set ?`
    // const data = username

    conn.query(sql,  (err, result) => {
        if(err) return res.send(err)

        let user = result[0]

        if(!user) return res.send('user tidak terdaftar')

        // cek password
        let cekPassword = bycrpt.compareSync(password, user.password)
        if(!cekPassword) return res.send ('password tidak sesuai')

        if(user.verifEmail) return res.send('silahkan verifikasi email')

        let token = jwt.sign({id :user.id})
        const data = {user_id : user.id, token : token} 

        conn.query(sql2, data,(err,result) => {
            if(err) return res.send(err)
        
            delete user.password
            delete user.avatar
            delete user.verivied

            res.send({
                message:'login sukses',
                user, 
                token
        })

        })
    })
})

// User Upload Avatar
router.post('/user/avatar', auth, upload.single('avatar'), async (req, res) => {

    try {
       const fileName = `${req.user.username}-avatar.png`
       const sql = `UPDATE users SET avatar = ? WHERE username = '${req.user.username}'`
 
       const data = [fileName, req.user.username]
 
       // Menyimpan foto di folder
       await sharp(req.file.buffer).resize(300).png().toFile(`${filesDirectory}/${fileName}`)
 
       // Simpan nama avata di kolom 'avatar'
       conn.query(sql, data, (err, result) => {
          // Jika ada error saat running sql
          if(err) return res.status(500).send(err)
 
          // Simpan nama fotonya di database
          res.status(201).send({ message: 'Berhasil di upload' })
       })
 
       
    } catch (err) {
       res.status(500).send(err.message)
    }
 
 }, (err, req, res, next) => {
    // Jika terdapat masalah terhadap multer, kita akan kirimkan error
    res.send(err)
 })

 module.exports = router