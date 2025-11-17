import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, TrendingUp, TrendingDown, Search, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MarketPage = () => {
  const { session } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'change_percent', direction: 'descending' });
  const [watchlist, setWatchlist] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const [marketRes, watchlistRes] = await Promise.all([
          supabase.from('market_data').select('*'),
          supabase.from('watchlists').select('symbol').eq('user_id', session.user.id)
        ]);

        if (marketRes.error) throw marketRes.error;
        if (watchlistRes.error) throw watchlistRes.error;

        setStocks(marketRes.data || []);
        const userWatchlistSymbols = new Set((watchlistRes.data || []).map(item => item.symbol));
        setWatchlist(userWatchlistSymbols);

      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const handleAddToWatchlist = async (stock) => {
    try {
      // Step 1: Ensure the stock exists in the main 'stocks' table first.
      const { error: stockUpsertError } = await supabase
        .from('stocks')
        .upsert(
            { 
                symbol: stock.symbol, 
                name: stock.symbol, // We can use the symbol as a default name
                current_price: stock.price,
                change_percent: stock.change_percent
            }, 
            { onConflict: 'symbol' }
        );

      if (stockUpsertError) throw stockUpsertError;

      // Step 2: Now that we know it exists, add it to the user's watchlist.
      const { error: watchlistInsertError } = await supabase
          .from('watchlists')
          .insert([{ user_id: session.user.id, symbol: stock.symbol, name: stock.symbol }]);
      
      if (watchlistInsertError && watchlistInsertError.code !== '23505') { // Ignore duplicate errors
        throw watchlistInsertError;
      }
      
      setWatchlist(prev => new Set(prev).add(stock.symbol));
    } catch (error) {
        console.error("Error adding to watchlist:", error);
    }
  };

  const sortedStocks = useMemo(() => {
    let sortableStocks = [...stocks];
    if (sortConfig.key) {
      sortableStocks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableStocks;
  }, [stocks, sortConfig]);
  
  const filteredStocks = sortedStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center p-10">Loading market data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Market Movers</h1>
      <div className="relative mb-6">
        <input 
          type="text"
          placeholder="Search stocks (e.g., RELIANCE)"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price (₹)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.map(stock => (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  <Link to={`/stock/${stock.symbol}`} className="hover:text-primary-600">{stock.symbol}</Link>
                </td>
                <td className="px-6 py-4 text-gray-800">{Number(stock.price).toLocaleString('en-IN')}</td>
                <td className={`px-6 py-4 font-medium ${stock.change_percent >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {stock.change_percent >= 0 ? <TrendingUp className="inline w-4 h-4 mr-1"/> : <TrendingDown className="inline w-4 h-4 mr-1"/>}
                    {Number(stock.change_percent).toFixed(2)}%
                </td>
                <td className="px-6 py-4">
                  {watchlist.has(stock.symbol) ? (
                    <span className="flex items-center text-sm text-gray-500">
                      <CheckCircle className="w-5 h-5 text-success-500 mr-2" />
                      Added
                    </span>
                  ) : (
                    <button onClick={() => handleAddToWatchlist(stock)} className="text-primary-600 hover:text-primary-800 transition-colors">
                      <PlusCircle className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketPage;