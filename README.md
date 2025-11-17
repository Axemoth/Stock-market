# Stock Market Watchlist App

A modern full-stack stock market application built with **React**, **Node.js**, and **Supabase**, featuring real-time data from the **NSE API** (Kotak API files currently unused and will be cleaned later).

---

## 🚀 Overview

This app enables users to create a personalized watchlist, view real-time market data, track portfolios, and place simulated trades.

### ✨ Key Features

* 🔐 **User Authentication** (Supabase Auth)
* 📊 **Watchlist** – Add & remove stocks
* 💹 **Real-time NSE Stock Data**
* 📈 **Market Overview & Charts**
* 💼 **Portfolio & P/L Tracking**
* 🧾 **Trading Dashboard** (Buy/Sell simulation)
* 📜 **Order History & Analytics**
* 📱 **Responsive UI (Tailwind CSS)**

---

## 🧱 Tech Stack

### Frontend

* React 18
* Tailwind CSS
* React Router
* Recharts
* Lucide React Icons

### Backend

* Node.js / Express.js
* Supabase (DB + Authentication)
* **NSE API Integration**

### Dev Tools

* Nodemon
* Concurrently

---

## 🛠 Installation

### 1. Clone repository

```bash
git clone https://github.com/Axemoth/Stock-market.git
cd Stock-market
```

### 2. Install dependencies

```bash
npm install
npm run install-all
```

---

## ⚙️ Environment Variables

### Backend - create `backend/.env`

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
NSE_API_KEY=your_nse_key
```

### Frontend - `frontend/.env`

```env
REACT_APP_SUPABASE_URL=your_url
REACT_APP_SUPABASE_ANON_KEY=your_key
REACT_APP_API_BASE_URL=http://localhost:5000
```

---

## ▶️ Running the Project

### Development

```bash
npm run dev
```

### Run individually

```bash
npm run server   # backend
npm run client   # frontend
```

---

## 📦 Project Structure

```
watchlist/
├── backend/
│   ├── routes/
│   │   ├── stocks.js        # NSE API integration
│   │   ├── trading.js
│   │   └── watchlist.js
│   ├── services/
│   │   └── nseApi.js        # NEW NSE service integration
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MarketOverview.js
│   │   │   ├── TradingForm.js
│   │   │   ├── PortfolioOverview.js
│   │   │   └── WatchlistSummary.js
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.js
```

> **Note:** Kotak API files currently exist but are unused. They will be removed/updated once NSE integration is complete.

---

## 🌱 Database (Supabase)

Tables required:

* `watchlists`
* `portfolio`
* `orders`
  (Policies enabled for row-level security)

---

## Future Enhancements

* WebSocket real-time updates
* TradingView advanced charts
* Push notifications / price alerts
* Mobile app (React Native)
* Paper trading & analytics

---

## 🤝 Contributing

Pull requests are welcome—open an issue for enhancements or fixes.

---

## 🆘 Support

* Check console logs
* Verify .env values
* Ensure backend is running correctly

---

**Happy Building & Happy Trading! 📈🔥**
