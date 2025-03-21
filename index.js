const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`MediSync server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
// no auth route as we are using cleerk to handle that thing 
app.use('/api/user', require('./Routes/user'));
app.use('/api/qr', require('./Routes/qr'));
app.use('/api/medical', require('./Routes/medical'));
app.use('/api/emergency', require('./Routes/emergency'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MediSync API' });
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;