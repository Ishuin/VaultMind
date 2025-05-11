const dotenv = require('dotenv');
dotenv.config(); // Call dotenv.config() at the very top

const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Initialize Razorpay client
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("Error: Razorpay Key ID or Key Secret is not defined in .env file.");
  // process.exit(1); // Optionally exit if keys are missing, or handle gracefully
}

let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  app.set('razorpayInstance', razorpayInstance); // Attach instance to app
  console.log("Razorpay client initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Razorpay client:", error);
  // Decide if you want to exit or let the server run without Razorpay functionality
  // For now, we'll let it run so we can see other potential issues, but payment routes will fail.
}

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Razorpay Backend Server is running!');
});

// TODO: Mount payment routes
app.use('/api', paymentRoutes); // Uncommented and mounted

app.listen(PORT, () => {
  console.log(`Razorpay backend server listening on port ${PORT}`);
  console.log('Press Ctrl+C to stop this server.');
});

// Keep the process alive for a very long time if listen doesn't
// This is a HACK and not for production, just for testing if listen is the issue
// setInterval(() => {
//   console.log('Main server (server.js) still alive...');
// }, 10000);

process.on('exit', (code) => {
  console.log(`[server.js] Process is about to exit with code: ${code}`);
});
// module.exports = { razorpayInstance }; // No longer exporting directly
