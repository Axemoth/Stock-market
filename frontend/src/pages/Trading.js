import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import TradingForm from '../components/TradingForm';
import PortfolioOverview from '../components/PortfolioOverview';
import OrderHistory from '../components/OrderHistory';
import TradingStats from '../components/TradingStats';

const Trading = () => {
  const { symbol } = useParams();
  const { session } = useAuth();
  const [stockData, setStockData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trade');

  useEffect(() => {
    const fetchTradingData = async () => {
      try {
        setLoading(true);
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
        
        // Fetch stock data if symbol is provided
        if (symbol) {
          const stockResponse = await fetch(`${baseUrl}/api/stocks/${symbol}`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`
            }
          });
          if (stockResponse.ok) {
            const stockData = await stockResponse.json();
            setStockData(stockData);
          }
        }

        // Fetch portfolio
        const portfolioResponse = await fetch(`${baseUrl}/api/trading/portfolio`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          setPortfolio(portfolioData);
        }

        // Fetch orders
        const ordersResponse = await fetch(`${baseUrl}/api/trading/orders?limit=20`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        }

        // Fetch trading stats
        const statsResponse = await fetch(`${baseUrl}/api/trading/stats`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching trading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradingData();
  }, [symbol, session]);

  const handleOrderPlaced = async () => {
    // Refresh data after order is placed
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    const portfolioResponse = await fetch(`${baseUrl}/api/trading/portfolio`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
    if (portfolioResponse.ok) {
      const portfolioData = await portfolioResponse.json();
      setPortfolio(portfolioData);
    }

    const ordersResponse = await fetch(`${baseUrl}/api/trading/orders?limit=20`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`
      }
    });
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      setOrders(ordersData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'trade', label: 'Trade', icon: BarChart3 },
    { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: Clock },
    { id: 'stats', label: 'Statistics', icon: DollarSign }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Trading Dashboard
        </h1>
        <p className="text-gray-600">
          Buy, sell, and manage your stock portfolio
        </p>
      </div>

      {/* Stock Info Card (if symbol is provided) */}
      {symbol && stockData && (
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{stockData.symbol}</h2>
              <p className="text-gray-600">{stockData.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                ₹{stockData.current_price?.toLocaleString()}
              </div>
              <div className={`flex items-center space-x-1 text-sm font-medium ${
                (stockData.change_percent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {(stockData.change_percent || 0) >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(stockData.change_percent || 0).toFixed(2)}%</span>
                <span>(₹{Math.abs(stockData.change || 0).toFixed(2)})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'trade' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trading Form */}
            <div className="lg:col-span-2">
                             <TradingForm 
                 symbol={symbol} 
                 stockData={stockData}
                 onOrderPlaced={handleOrderPlaced}
                 session={session}
               />
            </div>

            {/* Quick Portfolio Summary */}
            <div>
              <PortfolioOverview portfolio={portfolio} compact={true} />
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <PortfolioOverview portfolio={portfolio} compact={false} />
        )}

        {activeTab === 'orders' && (
          <OrderHistory orders={orders} />
        )}

        {activeTab === 'stats' && (
          <TradingStats stats={stats} />
        )}
      </div>
    </div>
  );
};

export default Trading;
