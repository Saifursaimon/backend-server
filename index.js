const express = require('express')
const cors = require('cors')
const productRoute = require('./routes/product')
const pinRoute = require('./routes/pin')
const recordRoute = require('./routes/record')
require('dotenv').config()


const app = express()


app.use(cors({
    origin: 'http://localhost:5173', 
  exposedHeaders: ['Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/', (req,res) => {
    res.send('Server Running')
})

app.use('/products', productRoute)
app.use('/pin',pinRoute)
app.use('/records', recordRoute)

app.listen(process.env.PORT, () => {
    console.log('backend server is running')
})