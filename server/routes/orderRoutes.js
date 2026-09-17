const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const validateOrder = require('../middleware/validateOrder');

router.post('/', validateOrder, async (req, res) => {
  try {
    const orderNumber = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = req.body.items.reduce((sum, item) => sum + (Number(item.price) || 60), 0);
    const order = await Order.create({
      orderNumber,
      items: req.body.items,
      totalAmount,
      pickupTime: req.body.pickupTime
    });
    res.status(201).json({ success: true, orderNumber: order.orderNumber, status: order.status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ success: false, error: "Не знайдено" });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;