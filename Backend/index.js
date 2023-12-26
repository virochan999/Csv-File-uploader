import express from 'express'
import cors from 'cors'
import db from './db/db.js'
import csvFileRouter from './routes/csvFileRoutes.js'

const app = express()

const port = process.env.port || 5000
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/upload', csvFileRouter)

app.listen(port, () => {
  console.log(`server listening at port ${port}`)
})