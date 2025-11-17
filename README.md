# Stock Market Watchlist App

A modern, full-stack stock market web application built with React, Node.js, and Supabase, featuring real-time stock data integration with Kotak API and comprehensive trading capabilities.

## � Kotak API Integration Status

Current implementation status and integration points for the Kotak API:

### Backend Integration Points
1. `backend/services/kotakApi.js` - Main Kotak API service implementation
2. `backend/routes/stocks.js` - Stock data and market endpoints
3. `backend/routes/trading.js` - Trading functionality endpoints

### Frontend Integration Points
1. `frontend/src/components/MarketOverview.js` - Market data display
2. `frontend/src/components/PortfolioOverview.js` - Portfolio tracking
3. `frontend/src/components/TradingForm.js` - Order placement
4. `frontend/src/pages/Trading.js` - Charts and analysis

## �🚀 Features

- **User Authentication**: Secure login/registration with Supabase
- **Stock Watchlist**: Add/remove stocks to personal watchlists
- **Real-time Data**: Live stock prices and market data from Kotak API
- **Market Overview**: Comprehensive market indices and trends
- **Stock Details**: Detailed stock information with charts
- **Trading Platform**: Buy and sell stocks with market and limit orders
- **Portfolio Management**: Track holdings, P&L, and performance
- **Order History**: Complete trading history with filtering and analytics
- **Trading Statistics**: Performance metrics, win rates, and insights
- **Responsive Design**: Modern UI that works on all devices
- **Search Functionality**: Find stocks quickly and easily

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Recharts** - Chart components for data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Supabase** - Backend-as-a-Service (database & auth)
- **Kotak API** - Stock market data provider

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Concurrently** - Run frontend and backend simultaneously

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Supabase account** and project
- **Kotak API credentials** (if using production data)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stock-market-watchlist
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
```

### 3. Environment Configuration

#### Backend (.env file in backend/ directory)

```bash
# Copy the example file
cp backend/env.example backend/.env

# Edit the .env file with your credentials
```

Required environment variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Kotak API Configuration
KOTAK_API_BASE_URL=https://api.kotaksecurities.com
KOTAK_API_KEY=your_kotak_api_key
KOTAK_CLIENT_ID=your_kotak_client_id
```

#### Frontend (.env file in frontend/ directory)

```bash
# Create .env file in frontend directory
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 4. Database Setup

#### Supabase Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Get your project URL and anon key
3. Create the following tables in your Supabase database:

```sql
-- Watchlists table
CREATE TABLE watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  notes TEXT,
  price_alert DECIMAL(10,2),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Portfolio table for trading
CREATE TABLE portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  avg_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Orders table for trading
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT')),
  side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'EXECUTED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlists
CREATE POLICY "Users can view their own watchlist" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watchlist items" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist items" ON watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlist items" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for portfolio
CREATE POLICY "Users can view their own portfolio" ON portfolio
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio items" ON portfolio
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio items" ON portfolio
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio items" ON portfolio
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);
```

### 5. Run the Application

#### Development Mode (Frontend + Backend)

```bash
# Run both frontend and backend simultaneously
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Individual Services

```bash
# Backend only
npm run server

# Frontend only
npm run client
```

#### Production Build

```bash
# Build frontend for production
npm run build
```

## 📁 Project Structure and Kotak API Integration Points

```
watchlist/
├── backend/                 # Node.js backend
│   ├── config/             # Configuration files
│   │   └── supabase.js     # Supabase configuration
│   ├── middleware/         # Express middleware
│   │   └── auth.js         # Authentication middleware
│   ├── routes/             # API routes
│   │   ├── stocks.js       # Stock data endpoints - ADD KOTAK API INTEGRATION HERE
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── watchlist.js    # Watchlist management
│   │   └── trading.js      # Trading functionality - ADD ORDER EXECUTION HERE
│   ├── services/           # Business logic services
│   │   └── kotakApi.js     # ADD KOTAK API SERVICE IMPLEMENTATION HERE
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   │   ├── index.html      # HTML entry point
│   │   └── manifest.json   # PWA manifest
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   │   ├── MarketOverview.js    # Market indices - ADD KOTAK MARKET DATA HERE
│   │   │   ├── Navbar.js            # Navigation component
│   │   │   ├── OrderHistory.js      # Order history display
│   │   │   ├── PortfolioOverview.js # Portfolio stats - ADD KOTAK PORTFOLIO HERE
│   │   │   ├── RecentActivity.js    # Recent trades
│   │   │   ├── TradingForm.js       # Buy/sell form - ADD KOTAK ORDER PLACEMENT
│   │   │   ├── TradingStats.js      # Trading analytics
│   │   │   └── WatchlistSummary.js  # Watchlist display
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.js # Main dashboard
│   │   │   ├── Login.js    # Login page
│   │   │   ├── Register.js # Registration page
│   │   │   └── Trading.js  # Trading dashboard - ADD KOTAK CHARTS HERE
│   │   ├── config/         # Frontend configuration
│   │   │   └── supabase.js # Supabase client config
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Stocks
- `GET /api/stocks/:symbol` - Get stock data
- `GET /api/stocks/search/:query` - Search stocks
- `GET /api/stocks/market/overview` - Market overview
- `GET /api/stocks/:symbol/history` - Stock historical data

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist` - Add stock to watchlist
- `DELETE /api/watchlist/:symbol` - Remove stock from watchlist
- `PUT /api/watchlist/:symbol` - Update watchlist item
- `GET /api/watchlist/prices` - Get watchlist with prices

### Trading
- `GET /api/trading/portfolio` - Get user portfolio
- `POST /api/trading/buy` - Place buy order
- `POST /api/trading/sell` - Place sell order
- `GET /api/trading/orders` - Get order history
- `GET /api/trading/orders/:orderId` - Get specific order
- `POST /api/trading/orders/:orderId/cancel` - Cancel pending order
- `GET /api/trading/stats` - Get trading statistics

## 💰 Trading Features

### Order Types
- **Market Orders**: Execute immediately at current market price
- **Limit Orders**: Execute only at specified price or better

### Portfolio Management
- **Real-time Holdings**: Track current positions and values
- **P&L Tracking**: Monitor realized and unrealized gains/losses
- **Performance Analytics**: Win rates, trade statistics, and insights

### Order Management
- **Order History**: Complete trading record with filtering
- **Status Tracking**: Pending, executed, and cancelled orders
- **Order Cancellation**: Cancel pending orders when needed

## 🎨 Customization

### Styling
The application uses Tailwind CSS for styling. You can customize:
- Colors in `frontend/tailwind.config.js`
- Component styles in `frontend/src/index.css`

### Components
- Reusable components are in `frontend/src/components/`
- Page components are in `frontend/src/pages/`
- Context providers are in `frontend/src/contexts/`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `frontend/build` folder
3. Set environment variables in your hosting platform

### Backend (Heroku/Railway)
1. Set environment variables in your hosting platform
2. Deploy the `backend/` folder
3. Update frontend API base URL

## 🔒 Security Features

- **JWT Authentication** with Supabase
- **Rate Limiting** on API endpoints
- **CORS Protection** with configurable origins
- **Input Validation** on all endpoints
- **Row Level Security** in Supabase
- **Order Validation** for trading operations

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your environment variables
3. Ensure Supabase is properly configured
4. Check the API endpoints are accessible
5. Verify database tables and policies are set up correctly

## 🔮 Future Enhancements

- Real-time price updates with WebSocket
- Advanced charting with TradingView
- Portfolio rebalancing tools
- News and market sentiment analysis
- Mobile app (React Native)
- Push notifications for price alerts
- Paper trading mode for practice
- Advanced order types (stop-loss, trailing stops)
- Options and derivatives trading
- Social trading features

---

**Happy Trading! 📈💰** #   S t o c k - m a r k e t  
 