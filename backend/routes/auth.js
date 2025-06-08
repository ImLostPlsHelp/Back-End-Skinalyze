import pool from '../db.js';
import bcrypt from 'bcrypt';

export default [
  {
    method: 'POST',
    path: '/api/signup',
    handler: async (request, h) => {
      const { firstName, lastName, email, password } = request.payload;
      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        await pool.query(
          'INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4)',
          [firstName, lastName, email, hashedPassword]
        );
        return h.response({ success: true }).code(201);
      } catch (err) {
        console.error(err);
        return h.response({ error: 'Email sudah terdaftar' }).code(400);
      }
    }
  }
];
