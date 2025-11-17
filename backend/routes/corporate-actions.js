const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

// Get upcoming corporate actions for a user's watchlist
router.get('/upcoming', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('corporate_actions')
      .select('*')
      .in('symbol', 
        supabase
          .from('watchlists')
          .select('symbol')
          .eq('user_id', userId)
      )
      .gte('effective_date', new Date().toISOString())
      .order('effective_date', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming corporate actions:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming corporate actions' });
  }
});

// Get corporate actions history for a symbol
router.get('/history/:symbol', authenticateUser, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { limit = 10, type } = req.query;

    let query = supabase
      .from('corporate_actions')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .order('effective_date', { ascending: false });

    if (type) {
      query = query.eq('action_type', type);
    }

    const { data, error } = await query.limit(parseInt(limit));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch corporate actions history' });
  }
});

// Get details of a specific corporate action
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('corporate_actions')
      .select(`
        *,
        stocks (
          symbol,
          name,
          current_price
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Corporate action not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch corporate action details' });
  }
});

module.exports = router;
