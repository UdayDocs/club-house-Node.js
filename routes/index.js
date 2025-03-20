const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');

// Root route
router.get('/', (req, res) => {
  res.render('home', { user: req.user || null });
});

// Signup page
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Handle signup
router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || password !== confirmPassword) {
    return res.render('signup', { error: 'All fields required, passwords must match.' });
  }

  try {
    if (await User.findOne({ where: { email } })) {
      return res.render('signup', { error: 'Email already in use.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ firstName, lastName, email, hashedPassword });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'An error occurred.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { message: null });
});

// Handle login
router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: false,
  })
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/login');
  });
});

// Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

module.exports = router;