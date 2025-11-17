const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');
const { getKotakStockData } = require('../services/kotakApi');

// Get user's portfolio
router.get('/portfolio', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Calculate portfolio summary
    let totalValue = 0;
    let totalPnL = 0;
    
    const portfolioWithPrices = await Promise.all(
      data.map(async (holding) => {
        // Get current stock price (in production, this would be real-time)
        const stockData = await getKotakStockData(holding.symbol);
        const currentPrice = stockData?.current_price || holding.avg_price;
        
        const marketValue = holding.quantity * currentPrice;
        const pnl = marketValue - (holding.quantity * holding.avg_price);
        const pnlPercent = ((pnl / (holding.quantity * holding.avg_price)) * 100);
        
        totalValue += marketValue;
        totalPnL += pnl;
        
        return {
          ...holding,
          current_price: currentPrice,
          market_value: marketValue,
          pnl: pnl,
          pnl_percent: pnlPercent
        };
      })
    );
    
    res.json({
      holdings: portfolioWithPrices,
      summary: {
        total_value: totalValue,
        total_pnl: totalPnL,
        total_pnl_percent: totalValue > 0 ? ((totalPnL / (totalValue - totalPnL)) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Place a buy order
router.post('/buy', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, quantity, price, orderType = 'MARKET' } = req.body;
    
    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid symbol and quantity are required' });
    }
    
    // Get current stock data
    const stockData = await getKotakStockData(symbol);
    if (!stockData) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    const executionPrice = orderType === 'MARKET' ? stockData.current_price : price;
    const totalAmount = quantity * executionPrice;
    
    // Check if user has sufficient balance (you'd implement balance checking)
    // For now, we'll assume they have sufficient funds
    
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          symbol: symbol.toUpperCase(),
          order_type: orderType,
          side: 'BUY',
          quantity: quantity,
          price: executionPrice,
          total_amount: totalAmount,
          status: 'EXECUTED',
          executed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (orderError) {
      return res.status(400).json({ error: orderError.message });
    }
    
    // Update portfolio
    const { data: existingHolding } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .single();
    
    if (existingHolding) {
      // Update existing holding
      const newQuantity = existingHolding.quantity + quantity;
      const newAvgPrice = ((existingHolding.quantity * existingHolding.avg_price) + totalAmount) / newQuantity;
      
      const { error: updateError } = await supabase
        .from('portfolio')
        .update({
          quantity: newQuantity,
          avg_price: newAvgPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingHolding.id);
      
      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }
    } else {
      // Create new holding
      const { error: portfolioError } = await supabase
        .from('portfolio')
        .insert([
          {
            user_id: userId,
            symbol: symbol.toUpperCase(),
            quantity: quantity,
            avg_price: executionPrice,
            company_name: stockData.name
          }
        ]);
      
      if (portfolioError) {
        return res.status(400).json({ error: portfolioError.message });
      }
    }
    
    res.status(201).json({
      message: 'Buy order executed successfully',
      order: order,
      execution_price: executionPrice,
      total_amount: totalAmount
    });
  } catch (error) {
    console.error('Error placing buy order:', error);
    res.status(500).json({ error: 'Failed to place buy order' });
  }
});

// Place a sell order
router.post('/sell', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, quantity, price, orderType = 'MARKET' } = req.body;
    
    if (!symbol || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid symbol and quantity are required' });
    }
    
    // Check if user has sufficient shares
    const { data: holding, error: holdingError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', symbol.toUpperCase())
      .single();
    
    if (holdingError || !holding) {
      return res.status(400).json({ error: 'You do not own any shares of this stock' });
    }
    
    if (holding.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient shares to sell' });
    }
    
    // Get current stock data
    const stockData = await getKotakStockData(symbol);
    if (!stockData) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    const executionPrice = orderType === 'MARKET' ? stockData.current_price : price;
    const totalAmount = quantity * executionPrice;
    const pnl = totalAmount - (quantity * holding.avg_price);
    
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          symbol: symbol.toUpperCase(),
          order_type: orderType,
          side: 'SELL',
          quantity: quantity,
          price: executionPrice,
          total_amount: totalAmount,
          status: 'EXECUTED',
          executed_at: new Date().toISOString()
        }
      ])
      .select()
      .single();
    
    if (orderError) {
      return res.status(400).json({ error: orderError.message });
    }
    
    // Update portfolio
    const newQuantity = holding.quantity - quantity;
    
    if (newQuantity === 0) {
      // Remove holding if all shares sold
      const { error: deleteError } = await supabase
        .from('portfolio')
        .delete()
        .eq('id', holding.id);
      
      if (deleteError) {
        return res.status(400).json({ error: deleteError.message });
      }
    } else {
      // Update existing holding
      const { error: updateError } = await supabase
        .from('portfolio')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', holding.id);
      
      if (updateError) {
        return res.status(400).json({ error: updateError.message });
      }
    }
    
    res.status(201).json({
      message: 'Sell order executed successfully',
      order: order,
      execution_price: executionPrice,
      total_amount: totalAmount,
      pnl: pnl
    });
  } catch (error) {
    console.error('Error placing sell order:', error);
    res.status(500).json({ error: 'Failed to place sell order' });
  }
});

// Get order history
router.get('/orders', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order by ID
router.get('/orders/:orderId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Cancel pending order
router.post('/orders/:orderId/cancel', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;
    
    // Check if order exists and belongs to user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending orders can be cancelled' });
    }
    
    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'CANCELLED',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }
    
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get trading statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total trades
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);
    
    if (ordersError) {
      return res.status(400).json({ error: ordersError.message });
    }
    
    // Calculate statistics
    const totalTrades = orders.length;
    const buyOrders = orders.filter(o => o.side === 'BUY');
    const sellOrders = orders.filter(o => o.side === 'SELL');
    
    const totalBuyAmount = buyOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalSellAmount = sellOrders.reduce((sum, order) => sum + order.total_amount, 0);
    
    // Get current portfolio value
    const { data: portfolio } = await supabase
      .from('portfolio')
      .select('*')
      .eq('user_id', userId);
    
    let currentPortfolioValue = 0;
    if (portfolio) {
      for (const holding of portfolio) {
        const stockData = await getKotakStockData(holding.symbol);
        const currentPrice = stockData?.current_price || holding.avg_price;
        currentPortfolioValue += holding.quantity * currentPrice;
      }
    }
    
    const stats = {
      total_trades: totalTrades,
      buy_trades: buyOrders.length,
      sell_trades: sellOrders.length,
      total_buy_amount: totalBuyAmount,
      total_sell_amount: totalSellAmount,
      current_portfolio_value: currentPortfolioValue,
      realized_pnl: totalSellAmount - totalBuyAmount, // Simplified calculation
      win_rate: sellOrders.length > 0 ? 
        (sellOrders.filter(o => o.total_amount > o.quantity * o.price).length / sellOrders.length * 100) : 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching trading stats:', error);
    res.status(500).json({ error: 'Failed to fetch trading statistics' });
  }
});

module.exports = router;

