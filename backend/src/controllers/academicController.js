const { body, validationResult } = require('express-validator');
const {
  upsertGrade,
  getGradesForEnrollment,
  getGradesForStudent,
  findEnrollmentById,
} = require('../models/gradeModel');
const {
  recordAttendance,
  getAttendanceForStudent,
  getAttendanceForEnrollment,
} = require('../models/attendanceModel');
const { findStudentByUserId } = require('../models/studentModel');

async function recordGrade(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { enrollmentId, score, gradeLetter } = req.body;

  try {
    const enrollment = await findEnrollmentById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const grade = await upsertGrade({
      enrollmentId,
      score,
      gradeLetter,
      recordedBy: req.user.id,
    });
    return res.status(201).json(grade);
  } catch (err) {
    console.error('Record grade error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMyGrades(req, res) {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const grades = await getGradesForStudent(student.id, req.query.semester);
    return res.json(grades);
  } catch (err) {
    console.error('Get my grades error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getEnrollmentGrades(req, res) {
  try {
    const grades = await getGradesForEnrollment(req.params.enrollmentId);
    return res.json(grades);
  } catch (err) {
    console.error('Get enrollment grades error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function markAttendance(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { enrollmentId, sessionDate, status } = req.body;

  try {
    const enrollment = await findEnrollmentById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    const record = await recordAttendance({ enrollmentId, sessionDate, status });
    return res.status(201).json(record);
  } catch (err) {
    console.error('Mark attendance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMyAttendance(req, res) {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const attendance = await getAttendanceForStudent(student.id, req.query.semester);
    return res.json(attendance);
  } catch (err) {
    console.error('Get my attendance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getEnrollmentAttendance(req, res) {
  try {
    const attendance = await getAttendanceForEnrollment(req.params.enrollmentId);
    return res.json(attendance);
  } catch (err) {
    console.error('Get enrollment attendance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const gradeValidation = [
  body('enrollmentId').isUUID(),
  body('score').optional().isFloat({ min: 0, max: 100 }),
  body('gradeLetter').optional().isLength({ min: 1, max: 2 }),
];

const attendanceValidation = [
  body('enrollmentId').isUUID(),
  body('sessionDate').isISO8601(),
  body('status').isIn(['present', 'absent', 'late', 'excused']),
];

module.exports = {
  recordGrade,
  getMyGrades,
  getEnrollmentGrades,
  markAttendance,
  getMyAttendance,
  getEnrollmentAttendance,
  gradeValidation,
  attendanceValidation,
};