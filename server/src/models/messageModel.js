import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    receiver : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    text : {
        type : String,
        
    },
    image : {
        type : String,
    },
    video : {
        type : String,
       
    },
   
},{timestamps:true});

const Messages = mongoose.model('Message', messageSchema);
export default Messages;

