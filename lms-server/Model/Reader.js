const mongoose = require('mongoose');

const readerSchema = new mongoose.Schema({

    firstName : {
        type: String,
        required: true,
        
    },
    lastName : {
        type: String,
        required: true,
    },
    contactNo : {
        type: String,
        required: true,
    },
   email : {
        type: String,
        required: true,
    },
    address : {
        type: String,
        required: true,
    },
    NIC : {
        type: String,
        required: true,
        unique: true
    },
    RID : {
        type: String,
        required: true,
        unique: true 
    }
},{timestamps: true})

module.exports = mongoose.model('Reader',readerSchema)