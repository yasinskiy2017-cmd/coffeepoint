# CoffeePoint ☕

> Вебсистема швидких експрес-замовлень кави на виніс (takeaway / to-go).

## 📌 Про проєкт
«CoffeePoint» — сучасний сервіс попереднього замовлення напоїв, розроблений для автоматизації роботи невеликих кав'ярень. Клієнти можуть сформувати замовлення через мобільний інтерфейс, обрати модифікатори (молоко, сиропи, цукор) та забрати напій без черги.

## 🛠 Технологічний стек
- **Frontend:** React, TypeScript, SCSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io (миттєве оновлення статусу замовлення)

## 🌿 Стратегія розгалуження (GitHub Flow)
- `main` — стабільна релізна гілка проєкту.
- `feature/*` — ізольовані гілки під конкретні таски (наприклад, `feature/TASK-01-setup`).

## 📁 Структура проєкту
```text
coffeepoint/
├── client/         # Клієнтська частина (React + TS + SCSS)
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── styles/
├── server/         # Серверна частина (Node.js + Express + MongoDB)
│   ├── models/
│   ├── routes/
│   └── controllers/
└── README.md       # Документація проєкту
