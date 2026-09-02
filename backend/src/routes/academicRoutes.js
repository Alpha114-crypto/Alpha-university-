const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  recordGrade,
  getMyGrades,
  getEnrollmentGrades,
  markAttendance,
  getMyAttendance,
  getEnrollmentAttendance,
  gradeValidation,
  attendanceValidation,
} = require('../controllers/academicController');

router.use(authenticate);

router.post('/grades', authorize('lecturer', 'admin'), gradeValidation, recordGrade);
router.get('/grades/me', authorize('student'), getMyGrades);
router.get('/grades/enrollment/:enrollmentId', authorize('lecturer', 'admin', 'registrar'), getEnrollmentGrades);

router.post('/attendance', authorize('lecturer', 'admin'), attendanceValidation, markAttendance);
router.get('/attendance/me', authorize('student'), getMyAttendance);
router.get('/attendance/enrollment/:enrollmentId', authorize('lecturer', 'admin', 'registrar'), getEnrollmentAttendance);

module.exports = router;