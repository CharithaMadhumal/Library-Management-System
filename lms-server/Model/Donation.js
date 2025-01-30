const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({

    donorName:{
        type:String,
        required: true,
        
    },
    bookTitle:{
        type:String,
        required: true,
    },
    category:{
        type:String,
        required: true,
    },
   language:{
        type:String,
        required: true,
    },
    author:{
        type:String,
        required: true,
    },
    quantity:{
        type:Number,
        default: 1,
    },

},{ timestamps: true});

module.exports = mongoose.model('Donation',donationSchema)