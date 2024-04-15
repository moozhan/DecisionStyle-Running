require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const jwt = require('jsonwebtoken');

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport configuration
passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());

// Auth0 callback handler
app.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/login' }),
  function(req, res) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/");
  }
);

// Generate JWT for an authenticated user
app.get('/jwt', (req, res) => {
  if (!req.user) {
    return res.sendStatus(401); // Unauthorized
  }

  const token = jwt.sign({
    sub: req.user.id, // Subject of the token
    name: req.user.displayName
  }, 'your_jwt_secret', { expiresIn: '1h' }); // You should move 'your_jwt_secret' to .env

  res.json({ token });
});

app.listen(3000, () => console.log('Server listening on http://localhost:3000'));
