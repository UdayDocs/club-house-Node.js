const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const sequelize = require('./db'); // Import from db.js
const User = require('./models/user');

dotenv.config();

const app = express();

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return done(null, false, { message: 'Incorrect email.' });
      const match = await bcrypt.compare(password, user.hashedPassword);
      if (!match) return done(null, false, { message: 'Incorrect password.' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
const routes = require('./routes/index');
app.use('/', routes);

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Sync DB
sequelize.sync({ force: true }) // Use force: true only in dev
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));

// Import additional models (after sync if needed)
require('./models/message');

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = app; // Export app only, sequelize is in db.js