const { body, validationResult } = require('express-validator');
const {
  findStudentByUserId,
  findStudentById,
  createStudent,
  listStudents,
} = require('../models/studentModel');

async function getMyProfile(req, res) {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    return res.json(student);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStudentById(req, res) {
  try {
    const student = await findStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.json(student);
  } catch (err) {
    console.error('Get student error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createStudentProfile(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { studentNumber, firstName, lastName, dateOfBirth } = req.body;

  try {
    const student = await createStudent({
      userId: req.user.id,
      studentNumber,
      firstName,
      lastName,
      dateOfBirth,
    });
    return res.status(201).json(student);
  } catch (err) {
    console.error('Create student error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Student number already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllStudents(req, res) {
  try {
    const { limit, offset } = req.query;
    const students = await listStudents({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    return res.json(students);
  } catch (err) {
    console.error('List students error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const createStudentValidation = [
  body('studentNumber').notEmpty().withMessage('Student number is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').optional().isISO8601(),
];

module.exports = {
  getMyProfile,
  getStudentById,
  createStudentProfile,
  getAllStudents,
  createStudentValidation,
};