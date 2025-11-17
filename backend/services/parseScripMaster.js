const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const filePath = path.join(__dirname, "ScripMaster.csv");

// Read raw file
let raw = fs.readFileSync(filePath, "utf8");

// Strip any HTML junk before the CSV header
const headerIndex = raw.indexOf("pSymbol");
if (headerIndex > 0) {
  raw = raw.slice(headerIndex); // keep only CSV part
}

try {
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const targetSymbols = [
    "RELIANCE", "TCS", "INFY", "HDFC", "ICICIBANK", "ITC", "HCLTECH",
    "WIPRO", "SUNPHARMA", "TATASTEEL", "ADANIENT", "ADANIPORTS", "APOLLOHOSP",
    "ASIANPAINT", "AXISBANK", "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV",
    "BPCL", "BHARTIARTL", "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB",
    "DRREDDY", "EICHERMOT", "GRASIM", "HDFCBANK", "HDFCLIFE", "HEROMOTOCO",
    "HINDALCO", "HINDUNILVR", "INDUSINDBK", "JSWSTEEL", "KOTAKBANK",
    "LTIM", "LT", "M&M", "MARUTI", "NTPC", "NESTLEIND", "ONGC",
    "POWERGRID", "SBILIFE", "SBIN", "TATACONSUM", "TATAMOTORS", "TECHM",
    "TITAN", "ULTRACEMCO"
  ];

  const symbolMap = {};

  for (const rec of records) {
    const sym = rec.pSymbol?.trim();
    const exch = rec.pExchSeg?.trim();
    const ref = rec.pScripRefKey?.trim();
    if (targetSymbols.includes(sym) && exch === "nse_cm") {
      symbolMap[sym] = `${exch}|${ref}`;
    }
  }

  const outPath = path.join(__dirname, "symbolMap.json");
  fs.writeFileSync(outPath, JSON.stringify(symbolMap, null, 2), "utf8");

  console.log("✅ Extracted SYMBOL_MAP and saved to symbolMap.json");
  console.log(symbolMap);

} catch (err) {
  console.error("❌ Parsing failed:", err.message);
}
