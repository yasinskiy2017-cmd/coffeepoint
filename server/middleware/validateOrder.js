module.exports = (req, res, next) => {
  const { items, pickupTime } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: "Кошик порожній" });
  }
  if (!pickupTime || new Date(pickupTime) <= new Date()) {
    return res.status(422).json({ success: false, error: "Некоректний час видачі" });
  }
  next();
};