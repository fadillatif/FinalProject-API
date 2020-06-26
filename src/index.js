const express = require('express')
const cors = require('cors')
const app = express()
const port = 2020


app.use(express.json())
app.use(cors())


app.get('/', (req, res) => {
  res.send(`API Running at ${port}`)
})

app.listen(port, () => console.log(`we're connected ${port}`))