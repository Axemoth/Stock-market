const axios = require('axios');
const { parse } = require('csv-parse/sync');
require('dotenv').config({ path: '../.env' });

// --- YOU CAN MANUALLY CHANGE THIS DATE ---
// If today's file fails, change this string to the last trading day.
// Format is "DD_MM_YYYY", for example: "01_09_2025"
const MANUAL_DATE_OVERRIDE = null; 
// -----------------------------------------

const symbolsToFind = new Set([
  'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK',
  'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BPCL', 'BHARTIARTL',
  'BRITANNIA', 'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY',
  'EICHERMOT', 'GRASIM', 'HCLTECH', 'HDFCBANK', 'HDFCLIFE',
  'HEROMOTOCO', 'HINDALCO', 'HINDUNILVR', 'ICICIBANK', 'ITC',
  'INDUSINDBK', 'INFY', 'JSWSTEEL', 'KOTAKBANK', 'LTIM',
  'LT', 'M&M', 'MARUTI', 'NTPC', 'NESTLEIND', 'ONGC',
  'POWERGRID', 'RELIANCE', 'SBILIFE', 'SBIN', 'SUNPHARMA',
  'TCS', 'TATACONSUM', 'TATAMOTORS', 'TATASTEEL', 'TECHM',
  'TITAN', 'ULTRACEMCO', 'WIPRO'
]);

function getFormattedDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}_${month}_${year}`;
}

async function fetchInstrumentCsv() {
  const dateToFetch = MANUAL_DATE_OVERRIDE || getFormattedDate();
  const url = `https://preferred.kotaksecurities.com/security/production/TradeApiInstruments_Cash_${dateToFetch}.txt`;
  
  console.log(`Downloading ScripMaster file from: ${url}`);

  try {
    const response = await axios.get(url);
    const records = parse(response.data, { columns: true, skip_empty_lines: true, relax_column_count: true });
    return records;
  } catch (err) {
    console.error(`❌ Failed to fetch instruments for ${dateToFetch}:`, err.message);
    if (!MANUAL_DATE_OVERRIDE) {
        console.log("💡 HINT: Today might be a holiday. Try setting the MANUAL_DATE_OVERRIDE in the script to the last trading day (e.g., '01_09_2025').");
    }
    return null;
  }
}

async function generateSymbolMap() {
  const instrumentList = await fetchInstrumentCsv();
  if (!instrumentList) {
    console.error("Could not download the instrument list. Aborting.");
    return;
  }
  
  const symbolMap = {};
  
  for (const instrument of instrumentList) {
    if (symbolsToFind.has(instrument.instrumentName)) {
      symbolMap[instrument.instrumentName] = instrument.instrumentToken;
      console.log(`✅ Found ${instrument.instrumentName}: ${instrument.instrumentToken}`);
    }
  }

  console.log("\n--- COPY THE OBJECT BELOW ---\n");
  console.log("const SYMBOL_MAP = {");
  for (const [key, value] of Object.entries(symbolMap)) {
    console.log(`  "${key}": "${value}",`);
  }
  console.log("};");
  console.log("\n--- END OF OBJECT ---");
}

generateSymbolMap();