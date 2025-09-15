import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
    },
    lastName : {
        type : String,
        required : true,
    },
    fullName : {
        type : String,
        required : true,
    },
    email : {
        type : String,  
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    imageURL : {
        type : String,
    },
    friends : [
        {
            type : mongoose.Schema.Types.ObjectId , ref : 'User'
        }
    ],
    lastSeen : {
        type : Date,
        default : null,
    },
},{timestamps : true});

const Users = mongoose.model('User', userSchema);
export default Users;