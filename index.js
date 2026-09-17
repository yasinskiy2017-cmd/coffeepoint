const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const mongoose = require('mongoose');
// Підключення до бази даних MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/coffeepoint')
  .then(() => console.log('[Database] MongoDB підключено успішно'))
  .catch(err => console.error('[Database Error]', err.message));
const server = http.createServer(app);

app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] }
});

let products = [
  {
    id: '1',
    title: 'Капучино',
    description: 'Збалансоване поєднання подвійного еспресо та оксамитової молочної піни.',
    category: 'Класична кава',
    basePrice: 55,
    sizes: ['S (250мл)', 'M (350мл) +15₴', 'L (450мл) +30₴'],
    milks: ['Коров\'яче', 'Безлактозне +10₴', 'Вівсяне +20₴', 'Кокосове +20₴']
  },
  {
    id: '2',
    title: 'Лате Макадамія',
    description: 'Ніжний напій із приємним вершково-горіховим посмаком.',
    category: 'Авторські напої',
    basePrice: 70,
    sizes: ['M (350мл)', 'L (450мл) +20₴'],
    milks: ['Коров\'яче', 'Мигдальне +20₴']
  },
  {
    id: '3',
    title: 'Флет Вайт',
    description: 'Насичений подвійний еспресо з мікропінним молоком.',
    category: 'Класична кава',
    basePrice: 65,
    sizes: ['Стандарт (220мл)'],
    milks: ['Коров\'яче', 'Безлактозне +10₴']
  },
  {
    id: '4',
    title: 'Матча Лате',
    description: 'Японський чай матча вищого сорту на кокосовому молоці.',
    category: 'Чай',
    basePrice: 75,
    sizes: ['M (350мл)'],
    milks: ['Кокосове', 'Вівсяне']
  }
];
// Схема збереження замовлення
const Order = mongoose.model('Order', new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: Array,
  totalAmount: Number,
  status: { type: String, default: 'pending' },
  pickupTime: Date
}, { timestamps: true }));
let orders = [];
let orderCounter = 101;

app.get('/api/products', (req, res) => res.json(products));
app.get('/api/orders', (req, res) => res.json(orders));
app.get('/', (req, res) => {
  res.send('Сервер CoffeePoint успішно працює! API доступне за адресою /api/products');
});
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, items, totalPrice } = req.body;
  const newOrder = {
    id: Date.now().toString(),
    orderNumber: '#' + orderCounter++,
    customerName,
    customerPhone,
    items,
    totalPrice,
    status: 'Нове',
    createdAt: new Date().toISOString()
  };
  orders.unshift(newOrder);
  io.emit('order:created', newOrder);
  res.status(201).json(newOrder);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = status;
    io.emit('order:statusChanged', order);
    res.json(order);
  } else {
    res.status(404).json({ error: 'Замовлення не знайдено' });
  }
});

io.on('connection', (socket) => {
  console.log('📡 Клієнт підключився по WebSocket:', socket.id);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log('✅ Серверний модуль запущено на http://localhost:' + PORT);
});
