const axios = require("axios");
const fs = require("fs");
const path = require("path");
const qs = require("qs");
require("dotenv").config({ path: "../.env" });

const { KOTAK_API_KEY, KOTAK_API_SECRET } = process.env;

let accessToken = null;
let tokenExpiry = null;

const AUTH_API_BASE = "https://napi.kotaksecurities.com";
const GW_API_BASE = "https://gw-napi.kotaksecurities.com";
const TOKEN_URL = `${AUTH_API_BASE}/oauth2/token`;

async function loginWithClientCredentials() {
  const response = await axios.post(
    TOKEN_URL,
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${KOTAK_API_KEY}:${KOTAK_API_SECRET}`
        ).toString("base64")}`,
      },
    }
  );
  return response.data;
}

async function loginToKotak() {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) return accessToken;
  console.log("🔑 Fetching new Kotak API token...");
  const data = await loginWithClientCredentials();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  console.log("✅ Kotak login successful");
  return accessToken;
}

async function fetchInstruments() {
  try {
    const token = await loginToKotak();

    // Try GW API
    const url = `${GW_API_BASE}/Files/1.0/instruments?segment=CASH`;
    console.log(`📥 Trying GW API: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          consumerKey: KOTAK_API_KEY,
          Accept: "text/plain",
        },
        responseType: "text",
      });

      // ✅ Check if file looks like CSV or HTML
      if (response.data.startsWith("<HTML") || response.data.startsWith("<!DOCTYPE html")) {
        console.error("❌ GW API returned HTML instead of CSV (blocked or invalid request).");
      } else if (response.data.includes("pSymbol")) {
        const filePath = path.join(__dirname, "ScripMaster.csv");
        fs.writeFileSync(filePath, response.data, "utf8");
        console.log(`✅ ScripMaster saved to ${filePath} (GW API)`);
        return;
      }
    } catch (err) {
      console.warn("⚠️ GW API failed, falling back to preferred.kotaksecurities.com");
    }

    // Fallback URL
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const dateStr = `${dd}_${mm}_${yyyy}`;

    const fallbackUrl = `https://preferred.kotaksecurities.com/security/production/TradeApiInstruments_Cash_${dateStr}.txt`;
    console.log(`📥 Downloading fallback ScripMaster: ${fallbackUrl}`);

    const response = await axios.get(fallbackUrl, { responseType: "text" });

    if (response.data.startsWith("<HTML") || response.data.startsWith("<!DOCTYPE html")) {
      console.error("❌ Fallback also returned HTML instead of CSV. Kotak may be blocking the request.");
      return;
    }

    const filePath = path.join(__dirname, "ScripMaster.csv");
    fs.writeFileSync(filePath, response.data, "utf8");
    console.log(`✅ ScripMaster saved to ${filePath} (Fallback)`);

  } catch (err) {
    console.error("❌ Failed to fetch instruments:", err.response?.data || err.message);
  }
}

fetchInstruments();
