const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const authRoute = require('./routes/authRoute')
const expenseRoute = require('./routes/expenseRoute')
const categoryRoute = require('./routes/categoryRoute')
const itemRoute = require('./routes/itemRoute')

const app = express()
dotenv.config({ quiet: true })

const databaseConnection = () => {
  mongoose.connect(process.env.MONGOURI).then(() => {
    console.log('Database Connected')
  }).catch((error) => {
    console.log('Database not connected!..', error)
  })
}

app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))
app.use(cors({
  credentials: true,
  origin : 'http://localhost:5173'
}))

app.use('/server/auth', authRoute)
app.use('/server/expenses', expenseRoute)
app.use('/server/categories', categoryRoute)
app.use('/server/items', itemRoute)

app.use((error, req, res, next) => {
  const errorStatus = error.status || 500
  const errorMessage = error.message || 'Something went wrong!..'
  return res.status(errorStatus).json({
    success : false,
    status : errorStatus,
    message : errorMessage,
    stack : error.stack
  })

})

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`)
  databaseConnection()
})
