// src/services/bookingService.js
const { pool } = require('../db');
const { v4: uuid } = require('uuid');

async function bookSeats({ showId, seats, userName }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the show row to prevent concurrent updates on total seats
    const showRes = await client.query(
      `SELECT * FROM shows WHERE id = $1 FOR UPDATE`,
      [showId]
    );
    if (showRes.rowCount === 0) {
      throw new Error('Show not found');
    }

    const show = showRes.rows[0];

    // Calculate already reserved seats (PENDING + CONFIRMED)
    const bookedRes = await client.query(
      `
      SELECT COALESCE(SUM(seats), 0) AS reserved
      FROM bookings
      WHERE show_id = $1
        AND status IN ('PENDING', 'CONFIRMED')
      `,
      [showId]
    );
    const reserved = parseInt(bookedRes.rows[0].reserved, 10);
    const remaining = show.total_seats - reserved;

    if (remaining < seats) {
      // Not enough seats
      const bookingId = uuid();
      await client.query(
        `
        INSERT INTO bookings (id, show_id, user_name, seats, status)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [bookingId, showId, userName || null, seats, 'FAILED']
      );
      await client.query('COMMIT');
      return { status: 'FAILED', reason: 'NOT_ENOUGH_SEATS', bookingId };
    }

    const bookingId = uuid();
    // For simplicity we directly set as CONFIRMED.
    // If you want PENDING + expiry logic, insert as PENDING and have a worker to flip it.
    await client.query(
      `
      INSERT INTO bookings (id, show_id, user_name, seats, status)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [bookingId, showId, userName || null, seats, 'CONFIRMED']
    );

    await client.query('COMMIT');

    return { status: 'CONFIRMED', bookingId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  bookSeats,
};
