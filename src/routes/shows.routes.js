// src/routes/shows.routes.js
const express = require('express');
const { pool } = require('../db');
const { v4: uuid } = require('uuid');

const router = express.Router();

/**
 * POST /api/shows
 * body: { name, startTime, totalSeats }
 * Admin: create show/trip/slot
 */
router.post('/', async (req, res) => {
  try {
    const { name, startTime, totalSeats } = req.body;

    if (!name || !startTime || !totalSeats) {
      return res.status(400).json({ message: 'name, startTime, totalSeats are required' });
    }

    const id = uuid();
    const result = await pool.query(
      `INSERT INTO shows (id, name, start_time, total_seats)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, name, startTime, totalSeats]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating show', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * GET /api/shows
 * List all shows with remaining seats
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.start_time,
        s.total_seats,
        COALESCE(SUM(CASE WHEN b.status IN ('PENDING','CONFIRMED') THEN b.seats ELSE 0 END), 0) AS booked_seats,
        (s.total_seats - COALESCE(SUM(CASE WHEN b.status IN ('PENDING','CONFIRMED') THEN b.seats ELSE 0 END), 0)) AS remaining_seats
      FROM shows s
      LEFT JOIN bookings b ON b.show_id = s.id
      GROUP BY s.id
      ORDER BY s.start_time ASC
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching shows', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
