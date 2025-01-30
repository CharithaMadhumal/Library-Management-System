const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(
    ()=>{
        console.log('Connected to Database');
    }

).catch((error)=>{
    console.log("Error connecting to Database",error);
})