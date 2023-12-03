const mongoose = require('mongoose')

const CouponSchema = new mongoose.Schema({
    userid: String,
    couponName:String,
    couponCode: String,
    discountAmount: Number,
    expirationDate: Date,
    description: String,
    isDeleted: {
        type: Boolean,
        default: false,
    },
})

const couponCollection = mongoose.model("coupondetails", CouponSchema)

module.exports = couponCollection;