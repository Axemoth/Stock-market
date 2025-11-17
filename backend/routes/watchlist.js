const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { loginToKotak, getKotakStockData } = require('../services/kotakApi');

// Get user's watchlist
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add stock to watchlist
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, name } = req.body;
    
    if (!symbol || !name) {
      return res.status(400).json({ error: 'Symbol and name are required' });
    }
    
    // Check if stock already exists in watchlist
    const { data: existingStock } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol)
      .single();
    
    if (existingStock) {
      return res.status(400).json({ error: 'Stock already in watchlist' });
    }
    
    // Add stock to watchlist
    const { data, error } = await supabase
      .from('watchlists')
      .insert([
        {
          user_id: userId,
          symbol: symbol.toUpperCase(),
          name: name,
          added_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(201).json({
      message: 'Stock added to watchlist',
      watchlistItem: data
    });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    res.status(500).json({ error: 'Failed to add stock to watchlist' });
  }
});

// Remove stock from watchlist
router.delete('/:symbol', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol } = req.params;
    
    const { error } = await supabase
      .from('watchlists')
      .delete()
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase());
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ message: 'Stock removed from watchlist' });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    res.status(500).json({ error: 'Failed to remove stock from watchlist' });
  }
});

// Update watchlist item (e.g., notes, alerts)
router.put('/:symbol', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol } = req.params;
    const { notes, price_alert } = req.body;
    
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (price_alert !== undefined) updateData.price_alert = price_alert;
    
    const { data, error } = await supabase
      .from('watchlists')
      .update(updateData)
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({
      message: 'Watchlist item updated',
      watchlistItem: data
    });
  } catch (error) {
    console.error('Error updating watchlist:', error);
    res.status(500).json({ error: 'Failed to update watchlist' });
  }
});

// Get watchlist with current stock prices
router.get('/prices', authenticateUser, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    
    // First get the watchlist items from the database
    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: 'Error fetching watchlist data from database'
      });
    }

    // Replace it with this:
if (!data || data.length === 0) {
  // Return a 200 OK with an empty array instead of a 404 error.
  return res.json([]);
}
    
    // Fetch live prices from Kotak API for each symbol
    try {
      const token = await loginToKotak();
      const watchlistWithPrices = await Promise.all(
        data.map(async (item) => {
          try {
            const liveData = await getKotakStockData(item.symbol, token);
            return {
              ...item,
              current_price: liveData?.current_price || null,
              change_percent: liveData?.change_percent || null,
              last_updated: new Date().toISOString()
            };
          } catch (error) {
            console.error(`Error fetching data for ${item.symbol}:`, error);
            return {
              ...item,
              current_price: null,
              change_percent: null,
              last_updated: new Date().toISOString()
            };
          }
        })
      );
      
      res.json(watchlistWithPrices);
    } catch (kotakError) {
      console.error('Kotak API error:', kotakError);
      // Fallback to just the watchlist data without live prices
      const watchlistWithFallback = data.map(item => ({
        ...item,
        current_price: null,
        change_percent: null,
        last_updated: new Date().toISOString()
      }));
      res.json(watchlistWithFallback);
    }
  } catch (error) {
    console.error('Error fetching watchlist prices:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist prices' });
  }
});

// Enriched watchlist with live prices from Kotak
router.get('/enriched', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    try {
      const token = await loginToKotak();
      const enriched = await Promise.all(
        (data || []).map(async (item) => {
          try {
            const liveData = await getKotakStockData(item.symbol, token);
            return {
              ...item,
              current_price: liveData?.current_price ?? null,
              change_percent: liveData?.change_percent ?? null,
              last_updated: new Date().toISOString()
            };
          } catch (e) {
            return { ...item, current_price: null, change_percent: null };
          }
        })
      );

      res.json(enriched);
    } catch (kotakError) {
      console.error('Kotak API error:', kotakError);
      // Fallback to basic data
      res.json(data || []);
    }
  } catch (error) {
    console.error('Error enriching watchlist:', error);
    res.status(500).json({ error: 'Failed to enrich watchlist' });
  }
});

// Sorted watchlist by various criteria including dividend yield
router.get('/sorted', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { by = 'dividend', order = 'desc' } = req.query;

    const { data, error } = await supabase
      .from('watchlists')
      .select('*')
      .eq('user_id', userId);

    if (error) return res.status(400).json({ error: error.message });

    try {
      const token = await loginToKotak();
      const withLive = await Promise.all(
        (data || []).map(async (item) => {
          try {
            const quote = await getKotakStockData(item.symbol, token);
            return {
              ...item,
              current_price: quote?.current_price ?? null,
              change_percent: quote?.change_percent ?? null,
              dividend_yield: item.dividend_yield ?? null // optional column if present
            };
          } catch (e) {
            return {
              ...item,
              current_price: null,
              change_percent: null,
              dividend_yield: item.dividend_yield ?? null
            };
          }
        })
      );

      const dir = order.toLowerCase() === 'asc' ? 1 : -1;
      const sorted = withLive.sort((a, b) => {
        if (by === 'price') return ((a.current_price ?? 0) - (b.current_price ?? 0)) * dir;
        if (by === 'symbol') return a.symbol.localeCompare(b.symbol) * dir;
        if (by === 'change') return ((a.change_percent ?? 0) - (b.change_percent ?? 0)) * dir;
        // default dividend (fallback to 0 if not available)
        return (((a.dividend_yield ?? 0) - (b.dividend_yield ?? 0)) * dir);
      });

      res.json(sorted);
    } catch (kotakError) {
      console.error('Kotak API error:', kotakError);
      // Fallback to basic sorting without live data
      const sorted = (data || []).sort((a, b) => {
        if (by === 'symbol') return a.symbol.localeCompare(b.symbol) * dir;
        if (by === 'dividend') return ((a.dividend_yield ?? 0) - (b.dividend_yield ?? 0)) * dir;
        return 0;
      });
      res.json(sorted);
    }
  } catch (error) {
    console.error('Error sorting watchlist:', error);
    res.status(500).json({ error: 'Failed to sort watchlist' });
  }
});

module.exports = router; 