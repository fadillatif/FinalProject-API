const conn = require('../config/database/index')
const router = require('express').Router()
// const verifSendEmail = require('../config/verifSendEmail')
const isEmail = require('validator/lib/isEmail')
const bcrypt = require('bcrypt')
// const multer = require('multer')
// const sharp = require('sharp')
// const path = require('path')
const jwt = require('../config/token/')
const auth2 = require('../config/auth2/')


// Register 
router.post('/register/admin', (req, res) => {
    const sql = `INSERT INTO users_admin SET ?`
    const data = req.body
    

   if(!isEmail(data.email)) return res.status(400).send({message : "Email is not valid"})

    data.password = bcrypt.hashSync(data.password, 8)

    // Running query(update database)
    conn.query(sql, data, (err, result) => {
        if(err) return res.status(500).send(err)

        res.status(200).send({ message: 'Register berhasil'})
   
    })
})

// Login
router.post('/admin/login', (req, res) => {
    const {username, password} = req.body
    
    const sql = `SELECT * FROM users_admin WHERE username = '${username}'`
    const sql2 = `INSERT INTO tokenAdmin SET ?`

    conn.query(sql, (err, result) => {
        if(err) return res.status(500).send(err)

        const user = result[0]

        if(!user) return res.status(404).send({message: 'username tidak ditemukan'})
     
        const hash = bcrypt.compareSync(password, user.password)
        if(!hash) return res.status(400).send({message: 'password tidak valid'})

        const data = {userAdmin_id : user.id, token : jwt.sign({id: user.id})}

        conn.query(sql2, data, (err, result) => {
            if(err) return res.status(500).send(err)
   
            // Menghapus beberapa property
            delete user.password
   
            res.status(200).send({message : "Berhasil Login", username: user.username})
         })
    })
})

// Update user
router.patch('/admin/profile', auth2, (req, res) => {
    const sql = `UPDATE users_admin SET ? WHERE id = ?`
    const data = [req.body, req.user.id]

    if(!isEmail(data[0].email)) return res.status(400).send({message: "Email is not valid"})

    data[0].password ? data[0].password = bcrypt.hashSync(data[0].password, 8) : delete data[0].password
                   
    conn.query(sql, data, (err, result) => {
       if(err) return res.status(500).send(err)
 
       res.status(200).send({ message : "Update berhasil"})
    })
})

// Get data user
router.get('/admins', auth2, (req,res) => {
    const sql = `SELECT * FROM users_admin`
    
    conn.query(sql, (err, result) => {
        if(err) return res.status(500).send(err)

        res.status(200).send(result)
    })
})

module.exports = router