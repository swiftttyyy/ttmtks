const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
    {
       name: {
        type: String
       },
       username: {
        type: String
       },
       email:{
        type: String
       },
       phone:{
        type: String
       },
       password:{
        type: String
       },
       deposit:{
        type: Number,
        default:  0.00
       },
       lastdeposit:{
         type: Number,
         default: 0.00
       },
       profit:{
        type: Number,
        default: 0.00
       },
       bonus:{
        type: Number,
        default: 10.00
       }
       

    }
)

const User = mongoose.model('User', UserSchema)

module.exports = User