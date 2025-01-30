const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({

    bookId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
        
    },
    bookTitle:{
        type: String,
        required: true,
    },
    copies:{
        type: Number,
        required: true,
    },
   status:{
        type: String,
        enum: ['In Stock','Out of Stock'],
        default: 'In Stock'
    },
    category:{
        type: String,
        required: true,
    },
   language:{
        type: String,
        required: true,
    },
    author:{
        type: String,
        required: true,
    }
  

},{timestamps: true})

module.exports = mongoose.model('Inventory',inventorySchema)