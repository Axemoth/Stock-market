const axios = require("axios");
const qs = require("qs");
require("dotenv").config();

const { KOTAK_API_KEY, KOTAK_API_SECRET } = process.env;

let accessToken = null;
let tokenExpiry = null;

const API_BASE = "https://napi.kotaksecurities.com";
const GW_API_BASE = "https://gw-napi.kotaksecurities.com";
const TOKEN_URL = `${API_BASE}/oauth2/token`;

async function loginWithClientCredentials() {
  const response = await axios.post(
    TOKEN_URL,
    qs.stringify({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${KOTAK_API_KEY}:${KOTAK_API_SECRET}`).toString("base64")}`,
      },
    }
  );
  return response.data;
}

const loginToKotak = async () => {
  try {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken;
    }
    console.log("🔑 Fetching new Kotak API token...");
    const data = await loginWithClientCredentials();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    console.log("✅ Kotak login successful");
    return accessToken;
  } catch (err) {
    console.error("❌ Kotak login failed:", err.response?.data || err.message);
    throw err;
  }
};

const getAuthenticatedApi = (token) => {
  return axios.create({
    baseURL: GW_API_BASE,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'consumerKey': KOTAK_API_KEY,
    }
  });
};

const getKotakQuote = async (instrumentId, quoteType = "all") => {
  try {
    const token = await loginToKotak();
    const api = getAuthenticatedApi(token);
    const urlPath = `/apim/quotes/1.0/quotes/neosymbol/${instrumentId}/${quoteType.toLowerCase()}`;
    const response = await api.get(urlPath);
    return response.data;
  } catch (err) {
    console.error(`❌ Error fetching quote for ${instrumentId}:`, err.response?.data || err.message);
    return null;
  }
};

module.exports = {
  loginToKotak,
  getKotakQuote,
};