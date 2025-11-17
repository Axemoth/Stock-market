const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws'); // <-- Import WebSocket
require('dotenv').config();

const { startMarketDataService } = require('./services/marketDataService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create a standard HTTP server
const server = http.createServer(app);

// Create a WebSocket server and attach it to the HTTP server
const wss = new WebSocketServer({ server });

// Function to broadcast data to all connected clients
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === 1) { // 1 means WebSocket.OPEN
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('🔌 New client connected to WebSocket');
  ws.on('close', () => {
    console.log('🔌 Client disconnected from WebSocket');
  });
});

// Start the market data service and pass it the WebSocket server instance
startMarketDataService(wss);

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});