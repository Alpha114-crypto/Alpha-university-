const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  register,
  login,
  refresh,
  registerValidation,
  loginValidation,
} = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
});

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/refresh', refresh);

module.exports = router;