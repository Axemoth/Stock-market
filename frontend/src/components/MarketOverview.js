import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary';
import { MarketOverviewSkeleton } from './Skeleton';

const safeNumber = (value) => {
  const num = Number(String(value).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

// A new, reusable component for displaying a single stock card
const StockCard = ({ stock, isGainer = true }) => {
  const changePercent = safeNumber(stock.change_percent);
  const colorClass = isGainer ? 'text-success-600' : 'text-danger-600';
  const bgColorClass = isGainer ? 'bg-success-50' : 'bg-danger-50';

  return (
    <Link 
      to={`/stock/${stock.symbol}`} 
      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-102 ${bgColorClass}`}
    >
      <div>
        <div className="font-bold text-gray-900">{stock.symbol}</div>
        {/* We can add the full company name here later if available */}
      </div>
      <div className="text-right">
        <div className={`font-bold ${colorClass}`}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
        <div className="text-sm text-gray-800">₹{safeNumber(stock.price).toLocaleString('en-IN')}</div>
      </div>
    </Link>
  );
};


const MarketOverviewContent = ({ data }) => {
  if (!data) {
    return <MarketOverviewSkeleton />;
  }

  const { topGainers = [], topLosers = [] } = data;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Gainers</h3>
        </div>
        <div className="space-y-3">
          {topGainers.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} isGainer={true} />
          ))}
        </div>
      </div>
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingDown className="w-5 h-5 text-danger-600" />
          <h3 className="text-lg font-semibold text-gray-900">Top Losers</h3>
        </div>
        <div className="space-y-3">
          {topLosers.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} isGainer={false} />
          ))}
        </div>
      </div>
    </div>
  );
};


const MarketOverview = ({ data }) => {
  return (
    <ErrorBoundary fallback="Unable to load market overview.">
      <MarketOverviewContent data={data} />
    </ErrorBoundary>
  );
};

export default MarketOverview;