const express = require('express');
const router = express.Router();
const { loginToKotak, getKotakStockData, searchStocks, getMarketIndices, getDividends } = require('../services/kotakApi');
const { authenticateUser } = require('../middleware/auth');
const { supabase } = require('../config/supabase');

// Get stock data by symbol
router.get('/:symbol', authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    const token = await loginToKotak();
    const stockData = await getKotakStockData(symbol, token);
    
    if (!stockData) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    res.json(stockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Search stocks
router.get('/search/:query', authenticateUser, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    // First search in our database
    const { data: dbResults, error: dbError } = await supabase
      .from('stocks')
      .select('*')
      .or(`symbol.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(parseInt(limit));

    if (dbError) throw dbError;

    if (dbResults.length > 0) {
      return res.json(dbResults);
    }

    // If no results in database, search via Kotak API
    const token = await loginToKotak();
    const apiResults = await searchStocks(query, token, parseInt(limit));

    // Store new results in database
    if (apiResults.length > 0) {
      const { error: insertError } = await supabase
        .from('stocks')
        .upsert(
          apiResults.map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange,
            sector: stock.sector,
            last_updated: new Date().toISOString()
          })),
          { onConflict: 'symbol' }
        );

      if (insertError) {
        console.error('Error storing search results:', insertError);
      }
    }

    res.json(apiResults);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

const { updateMarketData } = require('../services/marketDataService');

// Get market overview with live data
router.get('/market/overview', authenticateUser, async (req, res) => {
  try {
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('*')
      .order('change_percent', { ascending: false });

    if (stocksError) {
      throw stocksError;
    }

    // Get indices data from Kotak API
    const indices = [];
    

    // Calculate market stats
    const advances = stocks.filter(stock => stock.change_percent > 0).length;
    const declines = stocks.filter(stock => stock.change_percent < 0).length;
    const unchanged = stocks.length - advances - declines;

    const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0);

    const marketData = {
      indices,
      marketStatus: 'OPEN', // You might want to get this from Kotak API
      stats: {
        volume: totalVolume,
        advances,
        declines,
        unchanged
      },
      topGainers: stocks.slice(0, 3),
      topLosers: [...stocks].sort((a, b) => a.change_percent - b.change_percent).slice(0, 3)
    };

    res.json(marketData);
  } catch (error) {
    console.error('Error fetching market overview:', error);
    res.status(500).json({ error: 'Failed to fetch market overview' });
  }
});

// Get top gainers
router.get('/top-gainers', authenticateUser, async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .gt('change_percent', 0)
      .order('change_percent', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    res.status(500).json({ error: 'Failed to fetch top gainers' });
  }
});

// Get top losers
router.get('/top-losers', authenticateUser, async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .lt('change_percent', 0)
      .order('change_percent', { ascending: true })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching top losers:', error);
    res.status(500).json({ error: 'Failed to fetch top losers' });
  }
});

// Get stock historical data
router.get('/:symbol/history', authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1D', interval = '1min' } = req.query;
    const token = await loginToKotak();
    const data = await getKotakStockData(symbol, token, period, interval);
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Get dividend info for a symbol
router.get('/:symbol/dividends', authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    const info = await getDividends(symbol);
    res.json(info);
  } catch (error) {
    console.error('Error fetching dividends:', error);
    res.status(500).json({ error: 'Failed to fetch dividends' });
  }
});

module.exports = router; 