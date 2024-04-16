if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));


app.set('trust proxy', 1); // Trust first proxy
app.use(cors({
  origin: ['https://lazy-puce-tortoise-yoke.cyclic.app', 'https://moozhan.github.io'], // Update with the location of your HTML file
  credentials: true
}));
app.use(cookieParser());



app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: true, // Should be true in production when using HTTPS
    sameSite: 'None' // Can be strict or lax depending on your requirements
  }
}));

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

// Serve the HTML file as the root page
app.get('/', (req, res) => {
  res.render('index.ejs');
});

// Auth0 login route
app.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), (req, res) => {
  res.redirect('/callback');
});

// User data endpoint
app.get('/games', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('games.ejs', {name: req.user.nickname});
  } else {
    res.status(401).json({ error: 'User is not authenticated' });
  }
});

// Auth0 callback route
app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/games');
});

// User data endpoint
app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      name: req.user.displayName,
      emails: req.user.emails
    });
  } else {
    res.status(401).json({ error: 'User is not authenticated' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
