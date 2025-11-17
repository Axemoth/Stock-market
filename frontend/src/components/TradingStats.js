import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Target, Award, Clock } from 'lucide-react';

const TradingStats = ({ stats }) => {
  if (!stats) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No trading statistics available</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const calculateWinRate = () => {
    if (stats.sell_trades === 0) return 0;
    return (stats.win_rate || 0).toFixed(1);
  };

  const calculateTotalTradingValue = () => {
    return stats.total_buy_amount + stats.total_sell_amount;
  };

  const calculateAvgTradeSize = () => {
    if (stats.total_trades === 0) return 0;
    return calculateTotalTradingValue() / stats.total_trades;
  };

  const getPerformanceColor = (value) => {
    if (value >= 0) return 'text-success-600';
    return 'text-danger-600';
  };

  const getPerformanceBgColor = (value) => {
    if (value >= 0) return 'bg-success-50';
    return 'bg-danger-50';
  };

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trades</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_trades}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {stats.buy_trades} buys, {stats.sell_trades} sells
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.current_portfolio_value)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Current holdings value
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{calculateWinRate()}%</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Profitable trades
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Realized P&L</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(stats.realized_pnl)}`}>
                {formatCurrency(stats.realized_pnl)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPerformanceBgColor(stats.realized_pnl)}`}>
              {stats.realized_pnl >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-600" />
              )}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Closed positions
          </div>
        </div>
      </div>

      {/* Trading Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buy vs Sell Analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-success-600" />
                <span className="text-sm font-medium text-gray-700">Buy Orders</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-success-600">{stats.buy_trades}</div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(stats.total_buy_amount)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-danger-600" />
                <span className="text-sm font-medium text-gray-700">Sell Orders</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-danger-600">{stats.sell_trades}</div>
                <div className="text-sm text-gray-600">
                  {formatCurrency(stats.total_sell_amount)}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Trading Value</span>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(calculateTotalTradingValue())}
                  </div>
                  <div className="text-sm text-gray-600">
                    Avg: {formatCurrency(calculateAvgTradeSize())}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Return</span>
              <span className={`text-sm font-medium ${getPerformanceColor(stats.realized_pnl)}`}>
                {formatPercentage(stats.realized_pnl / Math.max(stats.total_buy_amount, 1) * 100)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm font-medium text-gray-900">{calculateWinRate()}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Avg Trade Size</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(calculateAvgTradeSize())}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Portfolio Growth</span>
              <span className={`text-sm font-medium ${getPerformanceColor(stats.current_portfolio_value - stats.total_buy_amount)}`}>
                {formatCurrency(stats.current_portfolio_value - stats.total_buy_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">{calculateWinRate()}%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {stats.total_trades > 0 ? Math.round(stats.total_trades / 30) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Trades/Month</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-lg font-bold text-gray-900">
              {stats.total_trades > 0 ? Math.round(calculateTotalTradingValue() / stats.total_trades) : 0}
            </div>
            <div className="text-sm text-gray-600">Avg Trade Value</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Recommendations</h3>
        <div className="space-y-3">
          {stats.total_trades === 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Start with small trades to build experience</span>
              </div>
            </div>
          )}
          
          {stats.total_trades > 0 && stats.win_rate < 50 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">Consider reviewing your trading strategy</span>
              </div>
            </div>
          )}
          
          {stats.total_trades > 0 && stats.win_rate >= 70 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">Excellent trading performance! Keep it up</span>
              </div>
            </div>
          )}
          
          {stats.total_trades > 10 && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-800">Consider diversifying your portfolio</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingStats;

