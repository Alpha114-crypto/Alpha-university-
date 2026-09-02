const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getMyProfile,
  getStudentById,
  createStudentProfile,
  getAllStudents,
  createStudentValidation,
} = require('../controllers/studentController');

router.use(authenticate);

router.get('/me', getMyProfile);
router.post('/me', createStudentValidation, createStudentProfile);
router.get('/', authorize('admin', 'registrar', 'lecturer'), getAllStudents);
router.get('/:id', authorize('admin', 'registrar', 'lecturer'), getStudentById);

module.exports = router;