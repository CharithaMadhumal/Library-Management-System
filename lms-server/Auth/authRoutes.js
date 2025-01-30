const express = require('express');
const router = express.Router();
const Admin = require('../Model/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Route for register admin

router.post('/register-admin',async(req,res)=>{
    try {

        const {username, password} = req.body

        if(!username || !password){
            return res.status(400).json({
                error: "Username and Password is required"
            })
        }

        const existingAdmin = await Admin.findOne({username});
        if(existingAdmin){
            return res.status(400).json({
                error: "Admin username already exists"
            })
        }

        //hash password

        const HashedPassword = await bcrypt.hash(password, 10)

        const newAdmin = new Admin({
            username,
            password:HashedPassword,
        })

        await newAdmin.save()
        
        res.status(201).json({
            message: 'New Admin account registered', adminId: newAdmin._id
        })


    } catch (error) {
        console.error("Error registering admin",error);
        res.status(500).json({
            error: 'Internal Server error'
        });
    }
})


//Route for login admin

router.post('/admin-login', async(req,res)=>{

    try {

        const {username, password} = req.body;

        //validate inputs

        if(!username || !password){
            return res.status(400).json({
                error: "Username and Password is required"
            })
        }

        //check username in admin panel

        const admin = await Admin.findOne({username});
        if(!admin){
            return res.status(401).json({
                error: "Username not valid"
            })
        }

        //check password

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid){
            return res.status(401).json({
                error: "Invalid password"
            })
        }

        //if all credintials are fine, then return token

        const token = jwt.sign(
            {adminId:admin._id, username: admin.username},
            process.env.jwtSecret,
            {expiresIn: '1h'}
        )

        //response with token

        res.status(200).json({message: "Login successful", token})
        
    } catch (error) {
        console.error("Error logging in admin",error);
        res.status(500).json({error: "Internal server error"})
    }
})


module.exports = router;