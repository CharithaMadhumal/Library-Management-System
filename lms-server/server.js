const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const cors = require('cors')

//middleware

app.use(bodyParser.json());
const corsOptions = {
    origin: 'http://localhost:3000',
}
app.use(cors(corsOptions));
app.use(express.json());

//database connection

require('./db')

//Load model

require('./Model/Admin')
require('./Model/Book')
require('./Model/Inventory')
require('./Model/Reader')
require('./Model/Donation')
require('./Model/Record')


//Routes

const authRoutes = require('./Auth/authRoutes');
app.use('/auth', authRoutes);

const appRoutes = require('./Auth/appRoutes');
app.use('/app',appRoutes);


//start the server

app.listen(port, ()=>{
    console.log(`Server is running on port, ${port}`)
})

//route handling

app.use((req,res, next)=>{
    const error = new Error('Route not Found');
    error.status()
})

//Error handling

app.use((req,res,next)=>{
    res.status(error.status || 500).json({
        error:error.message
    })
})