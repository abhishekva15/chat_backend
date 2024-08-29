const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true 
    },
    token:{
        type:String
    }
})

const User = mongoose.model('Users',userSchema);
module.exports = User