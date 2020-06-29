const express = require('express')
const cors = require('cors')
const app = express()
const port = 2020

const userRouter = require('./routes/userRouter')
const userAdminRouter = require('./routes/userAdminRouter')
const manageMenu = require('./routes/manageMenu')

app.use(express.json())
app.use(cors())
app.use(userRouter)
app.use(userAdminRouter)
app.use(manageMenu)


app.get('/', (req, res) => {
  res.send(`API Running at ${port}`)
})

app.listen(port, () => console.log(`we're connected ${port}`))