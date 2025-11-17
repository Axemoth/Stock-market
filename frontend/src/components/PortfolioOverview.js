import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const PortfolioOverview = ({ portfolio, compact = false }) => {
  if (!portfolio) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No portfolio data available</p>
        </div>
      </div>
    );
  }

  const { holdings = [], summary = {} } = portfolio;

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

  if (compact) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
          <DollarSign className="w-5 h-5 text-gray-400" />
        </div>

        {/* Portfolio Summary */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Value</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(summary.total_value || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total P&L</span>
            <span className={`font-medium ${
              (summary.total_pnl || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              {formatCurrency(summary.total_pnl || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">P&L %</span>
            <span className={`font-medium ${
              (summary.total_pnl_percent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              {formatPercentage(summary.total_pnl_percent || 0)}
            </span>
          </div>
        </div>

        {/* Holdings Count */}
        <div className="text-center py-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{holdings.length}</div>
          <div className="text-sm text-gray-600">Holdings</div>
        </div>

        {/* Quick Holdings List */}
        {holdings.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Holdings</h4>
            <div className="space-y-2">
              {holdings.slice(0, 3).map((holding) => (
                <div key={holding.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-gray-900">{holding.symbol}</div>
                    <div className="text-xs text-gray-600">{holding.quantity} shares</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(holding.market_value || 0)}
                    </div>
                    <div className={`text-xs ${
                      (holding.pnl_percent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {formatPercentage(holding.pnl_percent || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.total_value || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${
                (summary.total_pnl || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatCurrency(summary.total_pnl || 0)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              (summary.total_pnl || 0) >= 0 ? 'bg-success-100' : 'bg-danger-100'
            }`}>
              {(summary.total_pnl || 0) >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-danger-600" />
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">P&L %</p>
              <p className={`text-2xl font-bold ${
                (summary.total_pnl_percent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatPercentage(summary.total_pnl_percent || 0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Holdings</h3>
          <span className="text-sm text-gray-600">{holdings.length} stocks</span>
        </div>

        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No holdings yet</h3>
            <p className="text-gray-600">Start trading to build your portfolio</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Market Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => (
                  <tr key={holding.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                        <div className="text-sm text-gray-500">{holding.company_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {holding.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.avg_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.current_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(holding.market_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (holding.pnl || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {formatCurrency(holding.pnl || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        (holding.pnl_percent || 0) >= 0 ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {formatPercentage(holding.pnl_percent || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioOverview;

