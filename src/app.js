// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');

const showsRouter = require('./routes/shows.routes');
const bookingsRouter = require('./routes/bookings.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Simple healthcheck
app.get('/health', async (req, res) => {
  try {
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// API routes
app.use('/api/shows', showsRouter);
app.use('/api/bookings', bookingsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
