const { updateMarketData } = require('./marketDataService');

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000;

const initializeWebSocket = async () => {
    try {
        // In development mode, use mock data
        if (process.env.NODE_ENV === 'development') {
            console.log('Running in development mode - using mock data');
            setInterval(() => {
                updateMarketData().catch(console.error);
            }, 5000);
            return;
        }

        // ⚡ Kotak API WebSocket not available yet
        console.warn("⚠️ Kotak API WebSocket not implemented. Falling back to cron-based updates only.");
        return;

    } catch (error) {
        console.error('Error initializing WebSocket:', error);
        attemptReconnect();
    }
};

const attemptReconnect = () => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        setTimeout(initializeWebSocket, RECONNECT_INTERVAL);
    } else {
        console.error('Max reconnection attempts reached');
    }
};

const closeWebSocket = () => {
    console.log("Closing WebSocket (none active).");
};

module.exports = {
    initializeWebSocket,
    closeWebSocket
};
