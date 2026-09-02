const pool = require('../config/db');

async function recordAttendance({ enrollmentId, sessionDate, status }) {
  const result = await pool.query(
    `INSERT INTO attendance (enrollment_id, session_date, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [enrollmentId, sessionDate, status]
  );
  return result.rows[0];
}

async function getAttendanceForStudent(studentId, semester) {
  const params = [studentId];
  let query = `SELECT a.*, c.code, c.title
               FROM attendance a
               JOIN enrollments e ON e.id = a.enrollment_id
               JOIN courses c ON c.id = e.course_id
               WHERE e.student_id = $1`;
  if (semester) {
    params.push(semester);
    query += ` AND e.semester = $${params.length}`;
  }
  query += ` ORDER BY a.session_date DESC`;
  const result = await pool.query(query, params);
  return result.rows;
}

async function getAttendanceForEnrollment(enrollmentId) {
  const result = await pool.query(
    `SELECT * FROM attendance WHERE enrollment_id = $1 ORDER BY session_date DESC`,
    [enrollmentId]
  );
  return result.rows;
}

module.exports = {
  recordAttendance,
  getAttendanceForStudent,
  getAttendanceForEnrollment,
};