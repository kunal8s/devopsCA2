const http = require('http');
const app = require('./app.js');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
