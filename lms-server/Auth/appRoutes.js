const express = require('express');
const router = express.Router();
const Inventory = require('../Model/Inventory');
const Book = require('../Model/Book');
const crypto = require('crypto');
const Reader = require('../Model/Reader');
const Donation = require('../Model/Donation');


router.post('/add-book', async (req, res) => {
    try {
        const { bookTitle, category, language, author, copies } = req.body;

        // valid data
        if (!bookTitle || !category || !language || !author || !copies) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (copies <= 0) {
            return res.status(400).json({ error: "Copies must be greater than 0" });
        }

        // Check if book already exists
        const existingBook = await Book.findOne({ bookTitle, category, author, language });
        if (existingBook) {
            return res.status(400).json({ error: "Book already exists in the system" });
        }

        // Save book data
        const newBook = new Book({
            bookTitle,
            category,
            language,
            author,
            copies
        });

        await newBook.save();

        const newInventory = new Inventory({
            bookId: newBook._id,
            bookTitle,
            category,
            language,
            author,
            copies,
            status: 'In Stock'
        });
        await newInventory.save();

        res.status(201).json({
            message: "Book added successfully",
            book: newBook,
            inventory: newInventory
        });

    } catch (error) {
        console.error('Error in add-book:', error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


const generateRID = async () =>{
    while(true){
        const randomNumber = Math.floor(1000 + Math.random()*9000); // 4 digiy number
        const unqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const RID = `${randomNumber}-${unqueCode}-RID`;

      //check for ExReader

        const existingReader = await Reader.findOne({RID: RID});
        if(!existingReader){
            return RID;
        }
    }
}

//Add reader 

router.post('/add-reader', async(req,res)=>{
    try {

        const {firstName, lastName, contactNo, email, address, NIC} = req.body;

        //valid data

        if(!firstName || !lastName || !contactNo || !email || !address || ! NIC){
            return res.status(400).json({error: "All fields are required"})
        }

        //check for exiting reader

        const existingReader = await Reader.findOne({$or: [{NIC}, {email}]});
        if(existingReader){
            return res.status(400).json({error: "Existing Reader"})
        }
        
        const RID = await generateRID();

        const newReader = new Reader({
            firstName,
            lastName,
            contactNo,
            email,
            address,
            NIC,
            RID
        })

        await newReader.save();

        res.status(201).json({
            message: "Reader added successfully",
            reader: newReader
            
        });

    } catch (error) {
        res.status(500).json({error: "Internal server error"})

        
    }
})

// Retrive Reader Data

router.get('/get-all-readers', async(req,res)=>{
    try {

        const readers = await Reader.find();
        if(!readers){
            return res.status(404).json({error: "No readers found"})
        }

        res.status(200).json({readers});
        
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
        
    }
})

// create donation

router.post('/create-donation', async (req, res) => {
    try {
        const { donorName, bookTitle, author, category, language, quantity,copies } = req.body;

        // validate data
        if (!donorName || !bookTitle || !author || !category || !language || !quantity || !copies) {
            return res.status(400).json({ error: "All the inputs are required" });
        }

        if (quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be greater than 0" });
        }

        // check if the book is already within the system
        let existingBook = await Book.findOne({ bookTitle, category, author, language });
        let bookId;

        if (!existingBook) {
            const newBook = new Book({
                bookTitle,
                category,
                language,
                author,
                copies
            });
            await newBook.save();
            bookId = newBook._id;
        } else {
            bookId = existingBook._id;
        }

        // check if existing inventory for the book
        let existingInventory = await Inventory.findOne({ bookID: bookId });

        if (existingInventory) {
            existingInventory.copies += parseInt(quantity);
            await existingInventory.save();
        } else {
            const newInventory = new Inventory({
                bookId: bookId,
                bookTitle,
                category,
                language,
                author,
                copies: parseInt(quantity),
                status: 'In Stock'
            });
            await newInventory.save();
        }

        const newDonation = new Donation({
            donorName,
            bookTitle,
            category,
            language,
            author,
            quantity: parseInt(quantity)
        });
        await newDonation.save();

        res.status(201).json({
            message: "Book donated successfully",
            donation: newDonation
        });

    } catch (error) {
        console.error('Error in create-donation:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});





module.exports = router;