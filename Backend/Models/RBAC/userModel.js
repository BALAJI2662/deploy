const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        minlength : 2,
        maxlength : 100
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        match : [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password : {
        type : String,
        required : true,
        select : false,
        minlength : 6
    },
    image : {
        type : String ,
        default : "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
    },
    role : {
        type : String,
        enum : ["Admin" , "Instructor" , "Lead" , "Student" , "Empty"],
        default : "Empty"
    }
},{timestamps : true})

const userModel = mongoose.model("users" , userSchema)
module.exports = userModel