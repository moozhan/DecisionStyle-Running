if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const { auth, requiresAuth } = require('express-openid-connect');
const User = require('./models/user');

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('trust proxy', 1);
app.use(cors({
  origin: [
    'https://lazy-puce-tortoise-yoke.cyclic.app',
    'https://moozhan.github.io',
    'https://dev-backend.d4id81j7108zr.amplifyapp.com',
    'https://7rh93fhc7e.execute-api.eu-central-1.amazonaws.com'
  ],
  credentials: true
}));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION,
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'None'
  }
}));

app.use(auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  baseURL: process.env.BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  authRequired: false,
  auth0Logout: true,
  idTokenSigningAlg: 'RS256',
  secret: process.env.SESSION_SECRET
}));

const db = process.env.DB_CONNECTION;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.render('index.ejs'));
app.get('/about', (req, res) => res.render('about.ejs'));

app.get('/games/indecision', requiresAuth(), (req, res) => res.render('indecision.ejs'));

app.post('/games/indecision', requiresAuth(), async (req, res) => {
  try {
    const indecision = [
      req.body.zero, req.body.one, req.body.two, req.body.three,
      req.body.four, req.body.five, req.body.six, req.body.seven,
      req.body.eight, req.body.nine, req.body.ten, req.body.eleven,
      req.body.twelve, req.body.thirteen, req.body.fourteen
    ];
    const id = req.oidc.user.sub;
    await User.updateOne({ auth0Id: id }, { $push: { "indecision": indecision } });
    res.redirect('/games');
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/games', requiresAuth(), (req, res) => res.render('games.ejs'));

app.get('/user', requiresAuth(), (req, res) => {
  res.json({
    id: req.oidc.user.sub,
    name: req.oidc.user.name,
    emails: req.oidc.user.email
  });
});

app.get('/login', (req, res) => req.oidc.login({ returnTo: '/games' }));

app.get('/logout', (req, res) => {
  req.oidc.logout({ returnTo: req.protocol + '://' + req.get('host') });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
