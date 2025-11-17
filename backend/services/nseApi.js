const axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const NSE_HOMEPAGE_URL = 'https://www.nseindia.com/';
const NSE_API_URL = 'https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050';

const jar = new CookieJar();
const nseApi = wrapper(axios.create({ jar }));

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
};

/**
 * Fetches market data from NSE with a retry mechanism for authorization errors.
 */
const getNseMarketData = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Step 1: Always visit the homepage first to get a valid session cookie.
      console.log(`[Attempt ${i + 1}/${retries}] Establishing NSE session...`);
      await nseApi.get(NSE_HOMEPAGE_URL, { headers });

      // Step 2: Make the API call with the valid cookies.
      console.log("📈 Fetching live data from NSE API...");
      const response = await nseApi.get(NSE_API_URL, { headers });

      const stocks = response.data?.data;
      if (!stocks) {
        throw new Error("Invalid data structure in NSE API response.");
      }
      
      console.log(`✅ Successfully fetched data for ${stocks.length} stocks from NSE.`);
      return stocks; // If successful, exit the function.

    } catch (error) {
      const status = error.response?.status;
      const statusText = error.response?.statusText || error.message;
      console.error(`❌ Attempt ${i + 1} failed: ${statusText}`);

      // If this is the last attempt, stop trying.
      if (i === retries - 1) {
        console.error("❌ Max retries reached. Aborting fetch for this cycle.");
        return []; // Return empty array on final failure
      }
      
      // Wait for 2 seconds before the next retry.
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return []; // Should not be reached, but as a fallback
};

module.exports = { getNseMarketData };