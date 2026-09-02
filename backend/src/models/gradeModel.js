const pool = require('../config/db');

async function upsertGrade({ enrollmentId, score, gradeLetter, recordedBy }) {
  const result = await pool.query(
    `INSERT INTO grades (enrollment_id, score, grade_letter, recorded_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [enrollmentId, score, gradeLetter, recordedBy]
  );
  return result.rows[0];
}

async function getGradesForEnrollment(enrollmentId) {
  const result = await pool.query(
    `SELECT * FROM grades WHERE enrollment_id = $1 ORDER BY recorded_at DESC`,
    [enrollmentId]
  );
  return result.rows;
}

async function getGradesForStudent(studentId, semester) {
  const params = [studentId];
  let query = `SELECT g.*, c.code, c.title, c.credits, e.semester
               FROM grades g
               JOIN enrollments e ON e.id = g.enrollment_id
               JOIN courses c ON c.id = e.course_id
               WHERE e.student_id = $1`;
  if (semester) {
    params.push(semester);
    query += ` AND e.semester = $${params.length}`;
  }
  query += ` ORDER BY g.recorded_at DESC`;
  const result = await pool.query(query, params);
  return result.rows;
}

async function findEnrollmentById(enrollmentId) {
  const result = await pool.query('SELECT * FROM enrollments WHERE id = $1', [enrollmentId]);
  return result.rows[0];
}

module.exports = {
  upsertGrade,
  getGradesForEnrollment,
  getGradesForStudent,
  findEnrollmentById,
};