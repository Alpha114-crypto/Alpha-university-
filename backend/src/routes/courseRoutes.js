const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getCourses,
  getCourse,
  createNewCourse,
  enrollInCourse,
  getMyEnrollments,
  dropCourse,
  createCourseValidation,
} = require('../controllers/courseController');

router.use(authenticate);

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', authorize('admin', 'registrar'), createCourseValidation, createNewCourse);

router.post('/enroll', authorize('student'), enrollInCourse);
router.get('/enrollments/me', authorize('student'), getMyEnrollments);
router.delete('/enrollments/:enrollmentId', authorize('student'), dropCourse);

module.exports = router;