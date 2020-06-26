const conn = require('../database/')
const jwt = require('../token/')

// Function Authentication
const auth = (req, res, next) => {
   try{
      // Mengambil token saat proses menerima request
      let token = req.header('Authorization')
      // Mencoba mengambil data asli yang tersimpan di dalam token
      let decoded = jwt.verify(token)
      // Didalam token ada id user, selanjutnya di gunakan untuk mengambil data user di database
      let sqlToken = `SELECT token FROM tokens WHERE token = '${token}'`
      let sql = `SELECT id, username, name, email, avatar FROM users WHERE id = ${decoded.id}`

      conn.query(sqlToken, (err, result) => {
         if(err) return res.status(500).send(err)

         if(!result.length) return res.status(401).send({message: "Your session is expired"})

         conn.query(sql, (err, result ) => {
            if (err) return res.status(500).send(err)
    
            req.user= result[0]
            next()
        })
      })

   } catch (error) {
       res.status(500).send({err:error.message, token: req.header})
   }

}

module.exports = auth