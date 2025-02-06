const express = require('express');
const router = express.Router();
const Inventory = require('../Model/Inventory');
const Book = require('../Model/Book');
const crypto = require('crypto');
const Reader = require('../Model/Reader');
const Donation = require('../Model/Donation');
const Record = require('../Model/Record');


async function generateUniqueBookCode() {
    let bookCode;
    let isUnique = false;

    while (!isUnique) {
        const randomCode = `LB${crypto.randomInt(1000, 9999)}`;
        const existingBook = await Book.findOne({ bookCode: randomCode });

        if (!existingBook) {
            bookCode = randomCode;
            isUnique = true;
        }
    }

    return bookCode;
}

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

        const bookCode = await generateUniqueBookCode();

        // Save book data
        const newBook = new Book({
            bookTitle,
            category,
            language,
            author,
            copies,
            bookCode
        });

        await newBook.save();

        const newInventory = new Inventory({
            bookId: newBook._id,
            bookCode,
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


const generateRID = async () => {
    while (true) {
        const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4 digiy number
        const unqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const RID = `${randomNumber}-${unqueCode}-RID`;

        //check for ExReader

        const existingReader = await Reader.findOne({ RID: RID });
        if (!existingReader) {
            return RID;
        }
    }
}

//Add reader 

router.post('/add-reader', async (req, res) => {
    try {

        const { firstName, lastName, contactNo, email, address, NIC } = req.body;

        //valid data

        if (!firstName || !lastName || !contactNo || !email || !address || !NIC) {
            return res.status(400).json({ error: "All fields are required" })
        }

        //check for exiting reader

        const existingReader = await Reader.findOne({ $or: [{ NIC }, { email }] });
        if (existingReader) {
            return res.status(400).json({ error: "Existing Reader" })
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
        res.status(500).json({ error: "Internal server error" })


    }
})

// Retrive Reader Data

router.get('/get-all-readers', async (req, res) => {
    try {

        const readers = await Reader.find();
        if (!readers) {
            return res.status(404).json({ error: "No readers found" })
        }

        res.status(200).json({ readers });

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })

    }
})

// create donation

router.post('/create-donation', async (req, res) => {
    try {
        const { donorName, bookTitle, author, category, language, quantity, copies } = req.body;

        // validate data
        if (!donorName || !bookTitle || !author || !category || !language || !quantity || !copies) {
            return res.status(400).json({ error: "All the inputs are required" });
        }

        if (quantity <= 0) {
            return res.status(400).json({ error: "Quantity must be greater than 0" });
        }

        // check if the book is already within the system
        let existingBook = await Book.findOne({ bookTitle, category, author, language });
        let bookCode;

        if (!existingBook) {

            bookCode = await generateUniqueBookCode();

            const newBook = new Book({
                bookTitle,
                category,
                language,
                author,
                copies,
                bookCode
            });

            await newBook.save();

        } else {
            bookCode = existingBook.bookCode;
        }

        const newDonation = new Donation({
            donorName,
            bookTitle,
            category,
            language,
            author,
            quantity
        });
        await newDonation.save();

        // check if existing inventory for the book
        let existingInventory = await Inventory.findOne({ bookCode });

        if (existingInventory) {
            existingInventory.copies += quantity;
            await existingInventory.save();
        } else {
            const newInventory = new Inventory({
                bookCode,
                bookTitle,
                category,
                language,
                author,
                copies: quantity,
                status: 'In Stock'
            });
            await newInventory.save();
        }



        res.status(201).json({
            message: "Book donated successfully",
            donation: newDonation
        });

    } catch (error) {
        console.error('Error in create-donation:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


router.get('/get-all-books', async (req, res) => {
    try {
        const books = await Book.find();

        if (books.length === 0) {
            return res.status(404).json({ error: "No books found" })
        }

        res.status(200).json({
            message: 'Books retrieved successfully',
            books: books
        })

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })

    }
})

router.get('/get-inventory', async (req, res) => {
    try {
        const inventory = await Inventory.find().populate('bookId', 'bookTitle category language author');

        if (inventory.length === 0) {
            return res.status(404).json({ error: "No inventory found" })
        }

        res.status(200).json({
            message: 'Inventory retrieved successfully',
            inventory: inventory,
        })
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message })


    }
})

// route for hand over book

router.post('/hand-over', async (req, res) => {
    try {

        const { RID, bookCode, borrowDate } = req.body;

        // validate inputs

        if (!RID || !bookCode || !borrowDate) {
            return res.status(400).json({ error: "Please fill all fields" })
        }

        const inventory = await Inventory.findOne({ bookCode });

        if (inventory.copies <= 0) {
            return res.status(400).json({ error: "No copies available" })
        }

        // if found copies

        inventory.copies -= 1;
        inventory.status = inventory.copies === 0 ? "Out of Stock" : "In Stock";
        await inventory.save();

        // create a record

        const estimatedReturnDate = new Date(borrowDate);
        estimatedReturnDate.setDate(estimatedReturnDate.getDate() + 21);

        const newRecord = new Record({
            RID,
            bookCode,
            borrowDate,
            estimatedReturnDate,
            status: 'Handed Over',
        })

        await newRecord.save();

        res.status(201).json({
            message: "Book handed over successfully",
            record: newRecord,
        })

    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message })

    }
})

router.post('/return-book', async (req, res) => {
    try {

        const { RID, bookCode, actualReturnDate } = req.body;

        // validate inputs

        if (!RID || !bookCode || !actualReturnDate) {
            return res.status(400).json({ error: "Please fill all fields" })
        }

        const record = await Record.findOne({ RID, bookCode, status: 'Handed Over' });

        if (!record) {
            return res.status(404).json({ error: "Record not found" })
        }

        // if data found calculate delay day count

        const delay = Math.max(
            Math.ceil((new Date(actualReturnDate) - new Date(record.estimatedReturnDate)) / (1000 * 60 * 60 * 24)), 0

        )

        // update record

        record.actualReturnDate = actualReturnDate;
        record.delayedDays = delay;
        record.status = 'Not Handed Over';
        await record.save();

        // update inventory copies

        const inventory = await Inventory.findOne({ bookCode });
        if (inventory) {
            inventory.copies += 1;
            inventory.status = "In Stock";
            await inventory.save();
        }

        res.status(201).json({
            message: "Book returned successfully",
            record,
        })


    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message })

    }
})




module.exports = router;