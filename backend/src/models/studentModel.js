const pool = require('../config/db');

async function findStudentByUserId(userId) {
  const result = await pool.query('SELECT * FROM students WHERE user_id = $1', [userId]);
  return result.rows[0];
}

async function findStudentById(id) {
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
  return result.rows[0];
}

async function createStudent({ userId, studentNumber, firstName, lastName, dateOfBirth }) {
  const result = await pool.query(
    `INSERT INTO students (user_id, student_number, first_name, last_name, date_of_birth)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, studentNumber, firstName, lastName, dateOfBirth]
  );
  return result.rows[0];
}

async function listStudents({ limit = 50, offset = 0 } = {}) {
  const result = await pool.query(
    `SELECT s.*, u.email FROM students s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

module.exports = { findStudentByUserId, findStudentById, createStudent, listStudents };