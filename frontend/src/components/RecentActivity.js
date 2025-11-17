import React from 'react';
import { Activity, TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'watchlist_add',
      symbol: 'RELIANCE',
      message: 'Added to watchlist',
      timestamp: '2 hours ago',
      icon: Star,
      color: 'text-blue-600'
    },
    {
      id: 2,
      type: 'price_alert',
      symbol: 'TCS',
      message: 'Price alert triggered at ₹3,850',
      timestamp: '4 hours ago',
      icon: TrendingUp,
      color: 'text-success-600'
    },
    {
      id: 3,
      type: 'watchlist_remove',
      symbol: 'HDFC',
      message: 'Removed from watchlist',
      timestamp: '1 day ago',
      icon: TrendingDown,
      color: 'text-danger-600'
    },
    {
      id: 4,
      type: 'market_update',
      symbol: 'NIFTY 50',
      message: 'Market opened at 19,000',
      timestamp: '2 days ago',
      icon: Activity,
      color: 'text-gray-600'
    }
  ];

  const getActivityIcon = (activity) => {
    const Icon = activity.icon;
    return <Icon className={`w-4 h-4 ${activity.color}`} />;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <div className="flex-shrink-0 mt-1">
              {getActivityIcon(activity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{activity.symbol}</span>
                  <span className="text-sm text-gray-600">{activity.message}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all activity →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity; 