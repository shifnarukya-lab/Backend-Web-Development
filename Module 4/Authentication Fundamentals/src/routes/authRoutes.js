const express = require('express');
const { login, register } = require('../services/authService');
const router = express.Router();

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

router.post('/register', asyncHandler(async (req, res) => {
  const user = await register(req.body);
  return res.status(201).json({ data: user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const user = await login(req.body);
  return res.status(200).json({ data: user });
}));

module.exports = router;
