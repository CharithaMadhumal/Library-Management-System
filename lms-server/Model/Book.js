const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({

    bookTitle : {
        type: String,
        required: true,
        
    },
    category : {
        type: String,
        required: true,
    },
    copies : {
        type: String,
        required: true,
    },
    language : {
        type: String,
        required: true,
    },
   author : {
        type: String,
        required: true,
    }
   
},{timestamps: true})

module.exports = mongoose.model('Book',bookSchema)