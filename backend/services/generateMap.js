const axios = require("axios");
const qs =require("qs");
const { parse } = require("csv-parse/sync");
require("dotenv").config();

const { KOTAK_API_KEY, KOTAK_API_SECRET } = process.env;
const TOKEN_URL = "https://napi.kotaksecurities.com/oauth2/token";
const INSTRUMENTS_URL = "https://gw-napi.kotaksecurities.com/Files/1.0/instruments";

const symbolsToFind = new Set([
  'ADANIENT', 'ADANIPORTS', 'APOLLOHOSP', 'ASIANPAINT', 'AXISBANK',
  'BAJAJ-AUTO', 'BAJFINANCE', 'BAJAJFINSV', 'BPCL', 'BHARTIARTL', 'BRITANNIA',
  'CIPLA', 'COALINDIA', 'DIVISLAB', 'DRREDDY', 'EICHERMOT', 'GRASIM',
  'HCLTECH', 'HDFCBANK', 'HDFCLIFE', 'HEROMOTOCO', 'HINDALCO', 'HINDUNILVR',
  'ICICIBANK', 'ITC', 'INDUSINDBK', 'INFY', 'JSWSTEEL', 'KOTAKBANK', 'LTIM',
  'LT', 'M&M', 'MARUTI', 'NTPC', 'NESTLEIND', 'ONGC', 'POWERGRID', 'RELIANCE',
  'SBILIFE', 'SBIN', 'SUNPHARMA', 'TCS', 'TATACONSUM', 'TATAMOTORS',
  'TATASTEEL', 'TECHM', 'TITAN', 'ULTRACEMCO', 'WIPRO', 'HDFC'
]);

async function loginToKotak() {
  console.log("🔑 Authenticating with Kotak API...");
  try {
    const response = await axios.post(
      TOKEN_URL,
      qs.stringify({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${Buffer.from(`${KOTAK_API_KEY}:${KOTAK_API_SECRET}`).toString("base64")}`,
        },
      }
    );
    console.log("✅ Authentication successful.");
    return response.data.access_token;
  } catch (err) {
    console.error("❌ Authentication failed:", err.response?.data || err.message);
    throw err;
  }
}

async function fetchInstruments(token) {
  console.log("📥 Downloading ScripMaster file via API...");
  try {
    const response = await axios.get(INSTRUMENTS_URL, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "consumerKey": KOTAK_API_KEY,
        "Accept": "text/plain",
      },
      params: { "segment": "CASH" },
      responseType: "text",
    });

    if (response.data.toLowerCase().includes("<html")) {
      throw new Error("API returned an HTML error page instead of CSV.");
    }

    const headerIndex = response.data.split('\n').findIndex(line => line.startsWith("pSymbol,"));
    const cleanedCsv = response.data.split('\n').slice(headerIndex).join('\n');
    const records = parse(cleanedCsv, { columns: true, skip_empty_lines: true });
    
    console.log(`✅ Successfully downloaded and parsed ${records.length} instruments.`);
    return records;
  } catch (err) {
    console.error("❌ Failed to download ScripMaster file:", err.response?.data || err.message);
    throw err;
  }
}

async function generateSymbolMap() {
  try {
    const token = await loginToKotak();
    const instrumentList = await fetchInstruments(token);
    
    const symbolMap = {};
    for (const instrument of instrumentList) {
      if (symbolsToFind.has(instrument.pTrdSymbol)) {
        symbolMap[instrument.pTrdSymbol] = instrument.pScripRefKey;
      }
    }

    console.log("\n--- COPY THE COMPLETE SYMBOL_MAP OBJECT BELOW ---\n");
    console.log("const SYMBOL_MAP = {");
    for (const symbol of Array.from(symbolsToFind).sort()) {
      if (symbolMap[symbol]) {
        console.log(`  "${symbol}": "${symbolMap[symbol]}",`);
      } else {
        console.log(`  // "${symbol}": "COULD NOT FIND ID",`);
      }
    }
    console.log("};");
    console.log("\n--- END OF OBJECT ---");

  } catch (error) {
    console.log("\nScript failed to complete.");
  }
}

generateSymbolMap();