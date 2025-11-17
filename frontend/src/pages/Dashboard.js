import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, BarChart3, Activity, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import MarketOverview from '../components/MarketOverview';
import WatchlistSummary from '../components/WatchlistSummary';
import RecentActivity from '../components/RecentActivity';
import { MarketOverviewSkeleton } from '../components/Skeleton';
import AdvanceDeclineBar from '../components/AdvanceDeclineBar'; // <-- Import the new component

const QuickAction = ({ to, icon: Icon, title, bgColor, iconColor }) => (
  <Link to={to} className="card p-4 hover:shadow-md transition-shadow duration-200 group flex items-center space-x-4">
    <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <h3 className="font-semibold text-gray-800">{title}</h3>
  </Link>
);

const Dashboard = () => {
  const { session } = useAuth();
  const [marketData, setMarketData] = useState(null);
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!session?.user?.id) return;

        const { data, error } = await supabase.from('market_data').select('*');
        if (error) throw error;

        const allStocks = data || [];
        const validStocks = allStocks.filter(s => typeof s.change_percent === 'number');
        
        setMarketData({
          allStocks: validStocks,
          topGainers: [...validStocks].sort((a, b) => b.change_percent - a.change_percent).slice(0, 3),
          topLosers: [...validStocks].sort((a, b) => a.change_percent - b.change_percent).slice(0, 3),
        });

        const { data: watchlistData, error: watchlistError } = await supabase
          .from('watchlists').select('*').eq('user_id', session.user.id);
        if (watchlistError) throw watchlistError;

        const pricedWatchlist = (watchlistData || []).map(item => {
          const marketInfo = allStocks.find(stock => stock.symbol === item.symbol);
          return { ...item, price: marketInfo?.price || 'N/A' };
        });
        setWatchlistData(pricedWatchlist);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <MarketOverviewSkeleton />
      </div>
    );
  }
  
  const quickActions = [
    { to: "/trading", icon: DollarSign, title: "Start Trading", bgColor: "bg-success-100", iconColor: "text-success-600" },
    { to: "/watchlist", icon: Star, title: "Manage Watchlist", bgColor: "bg-primary-100", iconColor: "text-primary-600" },
    { to: "/market", icon: BarChart3, title: "Market Analysis", bgColor: "bg-blue-100", iconColor: "text-blue-600" },
    { to: "/stock/RELIANCE", icon: Activity, title: "Stock Details", bgColor: "bg-purple-100", iconColor: "text-purple-600" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-danger-50 rounded-lg text-danger-700">{error}</div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. New Advance/Decline Bar */}
          <AdvanceDeclineBar stocks={marketData?.allStocks} />
          
          {/* 2. Improved Gainer/Loser Cards */}
          <MarketOverview data={marketData} />

          {/* 3. More Prominent Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map(action => (
              <QuickAction key={action.title} {...action} />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <WatchlistSummary watchlist={watchlistData} />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;