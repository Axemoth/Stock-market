import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { XCircle, TrendingUp, TrendingDown, Star } from 'lucide-react';

const Watchlist = () => {
  const { session } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function fetches the initial state of the watchlist
    const fetchInitialData = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const { data: watchlistItems, error } = await supabase
          .from('watchlists')
          .select('id, symbol, name')
          .eq('user_id', session.user.id);
        if (error) throw error;

        const symbols = watchlistItems.map(item => item.symbol);
        const { data: marketData, error: marketError } = await supabase
          .from('market_data')
          .select('symbol, price, change_percent')
          .in('symbol', symbols);
        if (marketError) throw marketError;
        
        const pricedWatchlist = watchlistItems.map(item => {
          const marketInfo = marketData.find(stock => stock.symbol === item.symbol);
          return { ...item, price: marketInfo?.price || 'N/A', change_percent: marketInfo?.change_percent || 0 };
        });
        setWatchlist(pricedWatchlist);
      } catch (error) {
        console.error("Error fetching initial watchlist:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();

    // Connect to the backend WebSocket
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    // This is where the magic happens
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'market_update') {
        const updatedStocks = message.data;
        // Update the state with the new prices from the WebSocket message
        setWatchlist(currentWatchlist => 
          currentWatchlist.map(item => {
            const updatedStock = updatedStocks.find(stock => stock.symbol === item.symbol);
            return updatedStock ? { ...item, price: updatedStock.lastPrice, change_percent: updatedStock.pChange } : item;
          })
        );
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
      ws.close();
    };
  }, [session]);

  const handleRemoveFromWatchlist = async (id) => {
    // ... (this function remains the same) ...
  };
  
  if (loading) {
    return <div className="text-center p-10">Loading watchlist...</div>;
  }

  // ... (the rest of the JSX remains the same) ...
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
        <Link to="/market" className="btn-primary">Add New Stock</Link>
      </div>
      
      {watchlist.length === 0 ? (
        <div className="text-center card py-12">
          {/* ... empty state JSX ... */}
        </div>
      ) : (
        <div className="card">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remove</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {watchlist.map(stock => (
                <tr key={stock.id} className="hover:bg-gray-50 transition-colors duration-300">
                  <td className="px-6 py-4 font-bold text-gray-900">{stock.symbol}</td>
                  <td className="px-6 py-4 text-gray-800">{Number(stock.price).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className={`px-6 py-4 font-medium ${stock.change_percent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {stock.change_percent >= 0 ? <TrendingUp className="inline w-4 h-4 mr-1"/> : <TrendingDown className="inline w-4 h-4 mr-1"/>}
                    {Number(stock.change_percent).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleRemoveFromWatchlist(stock.id)} className="text-gray-400 hover:text-danger-600">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Watchlist;