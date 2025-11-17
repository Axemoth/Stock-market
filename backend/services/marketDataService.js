const cron = require("node-cron");
const { supabase } = require("../config/supabase");
const { getNseMarketData } = require("./nseApi");

async function updateMarketData(wss) { // <-- Accept the wss object
  try {
    console.log("📊 Updating market data from NSE source...");
    const nseStocks = await getNseMarketData();

    if (!nseStocks || nseStocks.length === 0) {
      console.warn("⚠️ No data received from NSE. Skipping update cycle.");
      return;
    }
    
    // Broadcast the fresh data to all connected WebSocket clients
    if (wss) {
      wss.broadcast(JSON.stringify({ type: 'market_update', data: nseStocks }));
    }

    const marketDataToUpsert = nseStocks.map(stock => ({
      symbol: stock.symbol,
      price: stock.lastPrice,
      change_percent: stock.pChange,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("market_data")
      .upsert(marketDataToUpsert, { onConflict: "symbol" });

    if (error) throw error;

    console.log(`✅ Successfully updated ${marketDataToUpsert.length} stocks in the database.`);
  } catch (err) {
    console.error(`❌ Error during market data update:`, err.message);
  }
}

// The start function now accepts the WebSocket server (wss)
function startMarketDataService(wss) {
  const runUpdate = () => updateMarketData(wss);

  console.log("🚀 Market data service configured with a dual schedule.");

  // --- SCHEDULE 1: During Market Hours (Weekdays) ---
  // This runs every 20 seconds, from 9:00 AM to 3:59 PM, Monday to Friday.
  cron.schedule("*/20 * 9-15 * * 1-5", () => {
    console.log("📈 Market is open. Fetching live data...");
    runUpdate();
  });

  // --- SCHEDULE 2: After Market Close & Weekends (All Days) ---
  // This runs once per day at 4:35 PM (16:35).
  // On weekdays, it gets the final closing price. On weekends, it gets Friday's closing price.
  cron.schedule("35 16 * * *", () => {
    console.log("📉 Market is closed. Running final daily price update...");
    runUpdate();
  });
  
  // Run once on startup to get initial data immediately
  setTimeout(() => {
    console.log("🚀 Kicking off initial market data update...");
    runUpdate();
  }, 1000);

  console.log("✅ Service scheduled for frequent updates during market hours and once daily after close.");
}

module.exports = {
  startMarketDataService,
};