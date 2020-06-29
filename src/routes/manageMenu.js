const conn = require('../config/database/index')
const router = require('express').Router()
// const isEmail = require('validator/lib/isEmail')
// const bcrypt = require('bcrypt')
const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const jwt = require('../config/token/')
const auth2 = require('../config/auth2/')
const shortid = require('shortid')


// Function Upload 
const productDirectory = path.join(__dirname, '../assets/products')

const product = multer ({
    limits: {fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ // will be error if the extension name is not one of these
            return cb(new Error('Please upload image file (jpg, jpeg, or png)')) 
        }
 
        cb(undefined, true)
    }
})


// Post Product
router.post('/product', auth2, product.single("picture"), (req, res) => {
    const sql = `INSERT INTO products SET ?`
    const data = {...req.body, user_id : req.user.id}

    conn.query(sql, data, async (err, result) => {
        if(err) return res.status(500).send(err)

        const fileName = `${shortid.generate()}.png`
        await sharp (req.file.buffer).resize(300).png().toFile(`${productDirectory}/${fileName}`)

        const sql2 =`UPDATE products SET picture = ? WHERE id = ?`
        const data = [fileName, result.insertId]

        conn.query(sql2, data, (err, result) => {
            if(err) return res.status(500).send(err)
    
            res.status(200).send({message: "Product Berhasil dimasukan"})
        }) 
    })
})

// Get Product
router.get('/products', auth2, (req, res) => {
    const sql = `SELECT * FROM products`

    conn.query(sql, (err, result) => {
        if(err) return res.status(500).send(err)

        res.status(200).send(result)
    })
})

// Delete Product
router.delete('/product/:productId', auth2, (req, res) => {
    const sql = `DELETE FROM products WHERE id = ? AND user_id = ?`
    const data = [req.params.productId, req.user.id]
 
    conn.query(sql, data, (err, result) => {
       if(err) return res.status(500).send(err.sqlMessage)
 
       res.status(200).send({
          message: "Product berhasil di hapus"
       })
    })
 })

module.exports = router