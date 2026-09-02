const pool = require('../config/db');

async function findCompletedCourseIds(studentId) {
  const result = await pool.query(
    `SELECT course_id FROM enrollments WHERE student_id = $1 AND status = 'completed'`,
    [studentId]
  );
  return result.rows.map((r) => r.course_id);
}

async function createEnrollment({ studentId, courseId, semester }) {
  const result = await pool.query(
    `INSERT INTO enrollments (student_id, course_id, semester)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [studentId, courseId, semester]
  );
  return result.rows[0];
}

async function findEnrollment(studentId, courseId, semester) {
  const result = await pool.query(
    `SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2 AND semester = $3`,
    [studentId, courseId, semester]
  );
  return result.rows[0];
}

async function listEnrollmentsForStudent(studentId, semester) {
  const params = [studentId];
  let query = `SELECT e.*, c.code, c.title, c.credits
               FROM enrollments e
               JOIN courses c ON c.id = e.course_id
               WHERE e.student_id = $1`;
  if (semester) {
    params.push(semester);
    query += ` AND e.semester = $${params.length}`;
  }
  const result = await pool.query(query, params);
  return result.rows;
}

async function dropEnrollment(enrollmentId, studentId) {
  const result = await pool.query(
    `UPDATE enrollments SET status = 'dropped'
     WHERE id = $1 AND student_id = $2
     RETURNING *`,
    [enrollmentId, studentId]
  );
  return result.rows[0];
}

module.exports = {
  findCompletedCourseIds,
  createEnrollment,
  findEnrollment,
  listEnrollmentsForStudent,
  dropEnrollment,
};