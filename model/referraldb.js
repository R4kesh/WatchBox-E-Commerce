
const mongoose = require('mongoose')

const ReferralCodeSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now, 
    },
    expirationDate: {
        type: Date,
        required: true,
        default: function () {
            const currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 30); 
            return currentDate;
        }
    },
    referrerCredit: {
        type: Number,
        default: 100, 
    },
    referredUserCredit: {
        type: Number,
        default: 50, 
    },
    referredUser: {
        type: String,

    },

});



const referralCodecollection = mongoose.model("ReferralCode", ReferralCodeSchema)

module.exports = referralCodecollection;