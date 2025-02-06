const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({

    bookCode : {
        type: String,
        required: true,
        
    },
    RID : {
        type: String,
        required: true,
    },
    borrowDate : {
        type: Date,
        required: true,
    },
    estimatedReturnDate : {
        type: Date,
        required: true,
    },
   actualReturnDate : {
        type: Date,
        
    },
    delayedDays: {
        type:Number,
        default: 0,
        
    },
    status:{
        type: String,
        enum:['Handed Over', 'Not Handed Over'],
        default: 'Not Handed Over'
    }
   
},{timestamps: true})

module.exports = mongoose.model('Record',recordSchema)