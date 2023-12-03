const mongoose = require("mongoose")


const WishlistSchema = new mongoose.Schema({
    UserId: String,
    Product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products',
        required:true,
    },
});
const WishlistCollection = mongoose.model("Wishlist", WishlistSchema);

module.exports = WishlistCollection;