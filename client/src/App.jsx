import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function App() {
  const [role, setRole] = useState('customer');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMilk, setSelectedMilk] = useState('');
  const [sugar, setSugar] = useState(1);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));

    fetch('http://localhost:5000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));

    socket.on('order:created', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('order:statusChanged', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      setActiveOrder(prev => (prev && prev.id === updatedOrder.id ? updatedOrder : prev));
    });

    return () => socket.off();
  }, []);

  const openCustomize = (p) => {
    setSelectedProduct(p);
    setSelectedSize(p.sizes[0]);
    setSelectedMilk(p.milks[0]);
    setSugar(1);
  };

  const addToCart = () => {
    let price = selectedProduct.basePrice;
    if (selectedSize.includes('+15')) price += 15;
    if (selectedSize.includes('+20')) price += 20;
    if (selectedSize.includes('+30')) price += 30;
    if (selectedMilk.includes('+10')) price += 10;
    if (selectedMilk.includes('+20')) price += 20;

    setCart([...cart, {
      title: selectedProduct.title,
      size: selectedSize,
      milk: selectedMilk,
      sugar,
      price
    }]);
    setSelectedProduct(null);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!name || !phone || cart.length === 0) return;

    const total = cart.reduce((acc, cur) => acc + cur.price, 0);
    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        items: cart,
        totalPrice: total
      })
    });
    const order = await res.json();
    setActiveOrder(order);
    setCart([]);
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  };

  return (
    <div>
      <header style={{
        background: '#4a3525', color: '#fff', padding: '15px 30px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>☕ CoffeePoint</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setRole('customer')}
            style={{
              padding: '8px 16px', borderRadius: '6px',
              background: role === 'customer' ? '#fff' : 'transparent',
              color: role === 'customer' ? '#4a3525' : '#fff',
              fontWeight: 'bold', border: '1px solid #fff'
            }}
          >
            Меню клієнта
          </button>
          <button 
            onClick={() => setRole('barista')}
            style={{
              padding: '8px 16px', borderRadius: '6px',
              background: role === 'barista' ? '#fff' : 'transparent',
              color: role === 'barista' ? '#4a3525' : '#fff',
              fontWeight: 'bold', border: '1px solid #fff'
            }}
          >
            Панель Бариста ({orders.filter(o => o.status !== 'Видано').length})
          </button>
        </div>
      </header>

      {role === 'customer' && (
        <main style={{ maxWidth: '1100px', margin: '30px auto', display: 'flex', gap: '30px', padding: '0 15px' }}>
          <div style={{ flex: 2 }}>
            <h3 style={{ marginBottom: '20px' }}>Кавове меню</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {products.map(p => (
                <div key={p.id} style={{
                  background: '#fff', padding: '20px', borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', background: '#ede3d8', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      {p.category}
                    </span>
                    <h4 style={{ margin: '10px 0 5px' }}>{p.title}</h4>
                    <p style={{ fontSize: '13px', color: '#6e655f', marginBottom: '15px' }}>{p.description}</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#4a3525' }}>від {p.basePrice} ₴</span>
                    <button 
                      onClick={() => openCustomize(p)}
                      style={{ background: '#7d5a3c', color: '#fff', padding: '6px 14px', borderRadius: '6px' }}
                    >
                      Обрати
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {activeOrder ? (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3>Замовлення {activeOrder.orderNumber}</h3>
                <div style={{
                  margin: '15px 0', padding: '10px', borderRadius: '6px', color: '#fff', textAlign: 'center', fontWeight: 'bold',
                  background: activeOrder.status === 'Нове' ? '#2196f3' : activeOrder.status === 'Готується' ? '#ff9800' : '#4caf50'
                }}>
                  Статус: {activeOrder.status}
                </div>
                <p style={{ fontSize: '14px', marginBottom: '5px' }}><strong>Клієнт:</strong> {activeOrder.customerName}</p>
                <p style={{ fontSize: '14px', marginBottom: '15px' }}><strong>Сума:</strong> {activeOrder.totalPrice} ₴</p>
                <button 
                  onClick={() => setActiveOrder(null)}
                  style={{ width: '100%', background: '#ede3d8', padding: '8px', borderRadius: '6px' }}
                >
                  Зробити нове замовлення
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3>Кошик ({cart.length})</h3>
                {cart.length === 0 ? (
                  <p style={{ color: '#888', marginTop: '10px', fontSize: '14px' }}>Кошик порожній</p>
                ) : (
                  <>
                    <div style={{ margin: '15px 0', maxHeight: '200px', overflowY: 'auto' }}>
                      {cart.map((item, idx) => (
                        <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{item.title}</strong>
                            <span>{item.price} ₴</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{item.size} • {item.milk} • цукор: {item.sugar}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', margin: '15px 0' }}>
                      <span>Разом:</span>
                      <span>{cart.reduce((a, b) => a + b.price, 0)} ₴</span>
                    </div>
                    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input 
                        type="text" required placeholder="Ваше ім'я" value={name} onChange={e => setName(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                      />
                      <input 
                        type="tel" required placeholder="Номер телефону" value={phone} onChange={e => setPhone(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                      />
                      <button 
                        type="submit" 
                        style={{ background: '#2e7d32', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}
                      >
                        Оформити замовлення
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {role === 'barista' && (
        <main style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 15px' }}>
          <h3>Черга замовлень бариста (Live WebSockets)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {orders.map(o => (
              <div key={o.id} style={{
                background: '#fff', padding: '20px', borderRadius: '12px',
                borderLeft: `6px solid ${o.status === 'Нове' ? '#2196f3' : o.status === 'Готується' ? '#ff9800' : '#4caf50'}`,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '18px' }}>{o.orderNumber}</strong>
                  <span style={{ fontSize: '12px', color: '#888' }}>{new Date(o.createdAt).toLocaleTimeString()}</span>
                </div>
                <p><strong>Клієнт:</strong> {o.customerName} ({o.customerPhone})</p>
                <div style={{ background: '#faf8f5', padding: '10px', borderRadius: '6px', margin: '10px 0' }}>
                  {o.items.map((it, i) => (
                    <div key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                      • <strong>{it.title}</strong> — {it.size}, {it.milk}, цукор: {it.sugar}
                    </div>
                  ))}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Сума: {o.totalPrice} ₴</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {o.status === 'Нове' && (
                    <button 
                      onClick={() => updateStatus(o.id, 'Готується')}
                      style={{ background: '#ff9800', color: '#fff', padding: '8px 12px', borderRadius: '6px', flex: 1 }}
                    >
                      Почати готувати
                    </button>
                  )}
                  {o.status === 'Готується' && (
                    <button 
                      onClick={() => updateStatus(o.id, 'Готово')}
                      style={{ background: '#4caf50', color: '#fff', padding: '8px 12px', borderRadius: '6px', flex: 1 }}
                    >
                      Готово до видачі
                    </button>
                  )}
                  {o.status === 'Готово' && (
                    <button 
                      onClick={() => updateStatus(o.id, 'Видано')}
                      style={{ background: '#757575', color: '#fff', padding: '8px 12px', borderRadius: '6px', flex: 1 }}
                    >
                      Видано клієнту
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {selectedProduct && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3>Налаштувати {selectedProduct.title}</h3>
            
            <div style={{ margin: '15px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Розмір порції:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {selectedProduct.sizes.map(s => (
                  <button 
                    key={s} onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '6px 10px', borderRadius: '6px', fontSize: '13px',
                      background: selectedSize === s ? '#7d5a3c' : '#eee',
                      color: selectedSize === s ? '#fff' : '#000'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: '15px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Молоко:</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {selectedProduct.milks.map(m => (
                  <button 
                    key={m} onClick={() => setSelectedMilk(m)}
                    style={{
                      padding: '6px 10px', borderRadius: '6px', fontSize: '13px',
                      background: selectedMilk === m ? '#7d5a3c' : '#eee',
                      color: selectedMilk === m ? '#fff' : '#000'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ margin: '15px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Стіки цукру: {sugar}</label>
              <input 
                type="range" min="0" max="4" value={sugar} onChange={e => setSugar(Number(e.target.value))}
                style={{ width: '100%', marginTop: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setSelectedProduct(null)}
                style={{ padding: '8px 14px', borderRadius: '6px', background: '#ddd' }}
              >
                Назад
              </button>
              <button 
                onClick={addToCart}
                style={{ padding: '8px 14px', borderRadius: '6px', background: '#2e7d32', color: '#fff', fontWeight: 'bold' }}
              >
                Додати в кошик
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
