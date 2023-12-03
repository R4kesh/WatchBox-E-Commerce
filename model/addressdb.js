const mongoose = require("mongoose")


const AddressSchema = new mongoose.Schema({
    userId: String,
    houseName: {
        type: String,
        required: true,
    },
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    }
});

const addressCollection = mongoose.model("Address", AddressSchema);

module.exports = addressCollection;