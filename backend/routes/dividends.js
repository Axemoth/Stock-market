const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

// Get upcoming dividends for a user's watchlist
router.get('/upcoming', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('upcoming_dividends')
      .select('*')
      .in('symbol', 
        supabase
          .from('watchlists')
          .select('symbol')
          .eq('user_id', userId)
      )
      .order('ex_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming dividends:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming dividends' });
  }
});

// Get dividend history for a symbol
router.get('/history/:symbol', authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 10 } = req.query;

    const { data, error } = await supabase
      .from('dividends')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('payment_date', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch dividend history' });
  }
});

// Set up dividend alerts
router.post('/alerts', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dividend_id } = req.body;

    const { data, error } = await supabase
      .from('dividend_alerts')
      .insert([
        {
          user_id: userId,
          dividend_id: dividend_id,
          notification_sent: false
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Alert already exists' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Dividend alert created',
      alert: data
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to create dividend alert' });
  }
});

// Remove dividend alert
router.delete('/alerts/:dividend_id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dividend_id } = req.params;

    const { error } = await supabase
      .from('dividend_alerts')
      .delete()
      .eq('user_id', userId)
      .eq('dividend_id', dividend_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Dividend alert removed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to remove dividend alert' });
  }
});

module.exports = router;
