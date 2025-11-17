import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const TradingForm = ({ symbol, stockData, onOrderPlaced, session }) => {
  const [orderType, setOrderType] = useState('MARKET');
  const [side, setSide] = useState('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (stockData && orderType === 'MARKET') {
      setPrice(stockData.current_price?.toString() || '');
    }
  }, [stockData, orderType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!symbol) {
        setError('Please select a stock to trade');
        return;
      }

      if (!quantity || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }

      if (orderType === 'LIMIT' && (!price || price <= 0)) {
        setError('Please enter a valid price for limit orders');
        return;
      }

      const orderData = {
        symbol: symbol.toUpperCase(),
        quantity: parseInt(quantity),
        orderType: orderType,
        ...(orderType === 'LIMIT' && { price: parseFloat(price) })
      };

          const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/trading/${side.toLowerCase()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify(orderData)
    });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to place order');
        return;
      }

      setSuccess(`${side} order placed successfully!`);
      setQuantity('');
      setPrice('');
      
      // Call callback to refresh data
      if (onOrderPlaced) {
        onOrderPlaced();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseInt(quantity) || 0;
    const prc = parseFloat(price) || stockData?.current_price || 0;
    return (qty * prc).toFixed(2);
  };

  const getCurrentPrice = () => {
    return stockData?.current_price || 0;
  };

  const getPriceChange = () => {
    return stockData?.change_percent || 0;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Place Order</h3>
        <div className="flex items-center space-x-2">
          {side === 'BUY' ? (
            <TrendingUp className="w-5 h-5 text-success-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-danger-600" />
          )}
          <span className={`text-sm font-medium ${
            side === 'BUY' ? 'text-success-600' : 'text-danger-600'
          }`}>
            {side}
          </span>
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOrderType('MARKET')}
            className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
              orderType === 'MARKET'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Market Order
          </button>
          <button
            type="button"
            onClick={() => setOrderType('LIMIT')}
            className={`py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
              orderType === 'LIMIT'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Limit Order
          </button>
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Order Side
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
              side === 'BUY'
                ? 'border-success-500 bg-success-50 text-success-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>BUY</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
              side === 'SELL'
                ? 'border-danger-500 bg-danger-50 text-danger-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingDown className="w-4 h-4" />
              <span>SELL</span>
            </div>
          </button>
        </div>
      </div>

      {/* Current Stock Info */}
      {stockData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">{stockData.symbol}</h4>
              <p className="text-sm text-gray-600">{stockData.name}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                ₹{getCurrentPrice().toLocaleString()}
              </div>
              <div className={`text-sm font-medium ${
                getPriceChange() >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {getPriceChange() >= 0 ? '+' : ''}{getPriceChange().toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quantity Input */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            step="1"
            className="input-field"
            placeholder="Enter quantity"
            required
          />
        </div>

        {/* Price Input (for Limit Orders) */}
        {orderType === 'LIMIT' && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              className="input-field"
              placeholder="Enter price"
              required
            />
          </div>
        )}

        {/* Order Summary */}
        {quantity && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Order Value:</span>
              <span className="font-medium text-gray-900">₹{calculateTotal()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-medium text-gray-900">{quantity}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium text-gray-900">
                ₹{orderType === 'MARKET' ? getCurrentPrice().toFixed(2) : price}
              </span>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 text-success-700 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !quantity || (orderType === 'LIMIT' && !price)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            side === 'BUY'
              ? 'bg-success-600 hover:bg-success-700 text-white disabled:bg-success-300'
              : 'bg-danger-600 hover:bg-danger-700 text-white disabled:bg-danger-300'
          } disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Placing Order...</span>
            </div>
          ) : (
            `${side} ${orderType === 'MARKET' ? 'at Market' : 'at Limit'}`
          )}
        </button>
      </form>

      {/* Order Type Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Order Type Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Market Order:</strong> Executes immediately at current market price</p>
          <p><strong>Limit Order:</strong> Executes only at your specified price or better</p>
        </div>
      </div>
    </div>
  );
};

export default TradingForm;
