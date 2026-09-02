const pool = require('../config/db');

async function listCourses({ department, limit = 50, offset = 0 } = {}) {
  const params = [];
  let query = `SELECT c.*, l.first_name AS lecturer_first_name, l.last_name AS lecturer_last_name
               FROM courses c
               LEFT JOIN lecturers l ON l.id = c.lecturer_id`;

  if (department) {
    params.push(department);
    query += ` WHERE c.department = $${params.length}`;
  }

  params.push(limit, offset);
  query += ` ORDER BY c.code LIMIT $${params.length - 1} OFFSET $${params.length}`;

  const result = await pool.query(query, params);
  return result.rows;
}

async function findCourseById(id) {
  const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
  return result.rows[0];
}

async function getPrerequisites(courseId) {
  const result = await pool.query(
    `SELECT cp.prerequisite_course_id, c.code, c.title
     FROM course_prerequisites cp
     JOIN courses c ON c.id = cp.prerequisite_course_id
     WHERE cp.course_id = $1`,
    [courseId]
  );
  return result.rows;
}

async function countEnrolledStudents(courseId, semester) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM enrollments
     WHERE course_id = $1 AND semester = $2 AND status = 'enrolled'`,
    [courseId, semester]
  );
  return parseInt(result.rows[0].count, 10);
}

async function createCourse({ code, title, description, credits, department, lecturerId, capacity }) {
  const result = await pool.query(
    `INSERT INTO courses (code, title, description, credits, department, lecturer_id, capacity)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [code, title, description, credits, department, lecturerId, capacity]
  );
  return result.rows[0];
}

module.exports = {
  listCourses,
  findCourseById,
  getPrerequisites,
  countEnrolledStudents,
  createCourse,
};