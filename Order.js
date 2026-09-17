const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    size: { type: String, enum: ['S', 'M', 'L'] },
    milk: { type: String, default: 'cow' },
    sugarCount: { type: Number, default: 0 },
    price: Number
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  pickupTime: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);