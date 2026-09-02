const { body, validationResult } = require('express-validator');
const {
  listCourses,
  findCourseById,
  getPrerequisites,
  countEnrolledStudents,
  createCourse,
} = require('../models/courseModel');
const {
  findCompletedCourseIds,
  createEnrollment,
  findEnrollment,
  listEnrollmentsForStudent,
  dropEnrollment,
} = require('../models/enrollmentModel');
const { findStudentByUserId } = require('../models/studentModel');

async function getCourses(req, res) {
  try {
    const { department, limit, offset } = req.query;
    const courses = await listCourses({
      department,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    return res.json(courses);
  } catch (err) {
    console.error('List courses error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCourse(req, res) {
  try {
    const course = await findCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const prerequisites = await getPrerequisites(course.id);
    return res.json({ ...course, prerequisites });
  } catch (err) {
    console.error('Get course error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createNewCourse(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const course = await createCourse(req.body);
    return res.status(201).json(course);
  } catch (err) {
    console.error('Create course error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Course code already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function enrollInCourse(req, res) {
  const { courseId, semester } = req.body;

  if (!courseId || !semester) {
    return res.status(400).json({ error: 'courseId and semester are required' });
  }

  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const course = await findCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existing = await findEnrollment(student.id, courseId, semester);
    if (existing && existing.status === 'enrolled') {
      return res.status(409).json({ error: 'Already enrolled in this course for this semester' });
    }

    const enrolledCount = await countEnrolledStudents(courseId, semester);
    if (enrolledCount >= course.capacity) {
      return res.status(409).json({ error: 'Course is at full capacity' });
    }

    const prerequisites = await getPrerequisites(courseId);
    if (prerequisites.length > 0) {
      const completed = await findCompletedCourseIds(student.id);
      const missing = prerequisites.filter(
        (p) => !completed.includes(p.prerequisite_course_id)
      );
      if (missing.length > 0) {
        return res.status(409).json({
          error: 'Missing prerequisites',
          missing: missing.map((m) => m.code),
        });
      }
    }

    const enrollment = await createEnrollment({ studentId: student.id, courseId, semester });
    return res.status(201).json(enrollment);
  } catch (err) {
    console.error('Enroll error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getMyEnrollments(req, res) {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const enrollments = await listEnrollmentsForStudent(student.id, req.query.semester);
    return res.json(enrollments);
  } catch (err) {
    console.error('List enrollments error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function dropCourse(req, res) {
  try {
    const student = await findStudentByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }
    const dropped = await dropEnrollment(req.params.enrollmentId, student.id);
    if (!dropped) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    return res.json(dropped);
  } catch (err) {
    console.error('Drop course error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const createCourseValidation = [
  body('code').notEmpty(),
  body('title').notEmpty(),
  body('credits').isInt({ min: 1 }),
];

module.exports = {
  getCourses,
  getCourse,
  createNewCourse,
  enrollInCourse,
  getMyEnrollments,
  dropCourse,
  createCourseValidation,
};