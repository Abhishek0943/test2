// src/routes/bookings.routes.js
const express = require('express');
const { pool } = require('../db');
const { bookSeats } = require('../services/bookingService');

const router = express.Router();

/**
 * POST /api/bookings
 * body: { showId, seats, userName }
 */
router.post('/', async (req, res) => {
  try {
    const { showId, seats, userName } = req.body;

    if (!showId || !seats || seats <= 0) {
      return res.status(400).json({ message: 'showId and positive seats are required' });
    }

    const result = await bookSeats({ showId, seats, userName });
    res.status(result.status === 'CONFIRMED' ? 201 : 409).json(result);
  } catch (err) {
    console.error('Error booking seats', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/bookings/:id
 * Get booking status
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, show_id, user_name, seats, status, created_at, updated_at
       FROM bookings WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching booking', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
