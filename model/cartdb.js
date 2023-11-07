const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'collection',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Productcollection',
        required: true,
      },
      productName: String, // Add this field for product name
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  totalQuantity: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cart =new mongoose.model('Cart', CartSchema);

module.exports = Cart;