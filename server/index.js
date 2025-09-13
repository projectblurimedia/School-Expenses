const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const authRoutes = require('./routes/authRoute');


const app = express()
dotenv.config({ quiet: true })

// Database Connection
const databaseConnection = () => {
  mongoose.connect(process.env.MONGOURI).then(() => {
    console.log('Database Connected')
  }).catch((error) => {
    console.log('Database not connected!..', error)
  })
}

// Middlewares
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))
app.use(cors({
    credentials: true,
    origin : 'http://localhost:5173'
}))

// Routes
app.use('/server/auth', authRoutes);

// Error Handling
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

// Server Connection
app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
    databaseConnection()
})
