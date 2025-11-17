import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus } from 'lucide-react';
import { supabase } from '../config/supabase';

const WatchlistSummary = ({ watchlist: initialWatchlist = [] }) => {
  const [watchlist, setWatchlist] = useState(initialWatchlist);

  useEffect(() => {
    setWatchlist(initialWatchlist);

    const handleRealtimeUpdates = (payload) => {
      const updatedStock = payload.new;
      setWatchlist((currentWatchlist) =>
        currentWatchlist.map((stock) =>
          stock.symbol === updatedStock.symbol
            ? { ...stock, price: updatedStock.price, change_percent: updatedStock.change_percent }
            : stock
        )
      );
    };

    const subscription = supabase
      .channel('public:market_data')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'market_data' }, handleRealtimeUpdates)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [initialWatchlist]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Watchlist</h3>
        {/* CORRECTED: This button now links to the Market page */}
        <Link
          to="/market"
          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock</span>
        </Link>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">Your watchlist is empty</p>
          {/* CORRECTED: This button also links to the Market page */}
          <Link to="/market" className="btn-primary text-sm">
            Add your first stock
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.slice(0, 5).map((stock) => (
            <div key={stock.id || stock.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
              <div>
                <div className="font-medium text-gray-900">{stock.symbol}</div>
                <div className="text-sm text-gray-600 truncate">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">₹{Number(stock.price).toLocaleString('en-IN') || 'N/A'}</div>
              </div>
            </div>
          ))}
          {watchlist.length > 5 && (
            <div className="text-center pt-2">
              <Link to="/watchlist" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all {watchlist.length} stocks →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WatchlistSummary;