if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const gameRoutes = require('./routes/gameRoutes');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { requiresAuth } = require('express-openid-connect');
const User = require('./models/user');
const bodyParser = require('body-parser');

const app = express();
// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('trust proxy', 1); // Trust first proxy
app.use(cors({
  origin: ['https://lazy-puce-tortoise-yoke.cyclic.app', 'https://moozhan.github.io', 'https://dev-backend.d4id81j7108zr.amplifyapp.com', 'https://7rh93fhc7e.execute-api.eu-central-1.amazonaws.com'], // Update with the location of your HTML file
  credentials: true
}));
app.use(cookieParser());

// DB Config
const db = process.env.DB_CONNECTION;
const options = {
  serverSelectionTimeoutMS: 10000, // Extend the timeout to 10 seconds
  socketTimeoutMS: 45000, // Increase the socket timeout to give more flexibility
};
// Connect to MongoDB
mongoose
  .connect(db, options)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));



app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: db, // Your MongoDB connection string
    mongoOptions: options
  }),
  cookie: {
    httpOnly: true,
    secure: true, // Ensure cookies are sent over HTTPS in production
    sameSite: 'None' // Can be strict or lax depending on your requirements
  }
}));



passport.use(new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.AUTH0_CALLBACK_URL
},
  function (accessToken, refreshToken, extraParams, profile, done) {
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

//================================================== all the pages 
app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/about', (req, res) => {
  res.render('about.ejs');
});


app.get('/games/indecision', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('indecision.ejs');
  } else {
    res.status(401).json({ error: 'User is not authenticated' });
  }
});

app.post('/games/indecision',  (req, res) => {
  if (req.isAuthenticated()) {
    const indecision = [
      req.body.zero,
      req.body.one,
      req.body.two,
      req.body.three,
      req.body.four,
      req.body.five,
      req.body.six,
      req.body.seven,
      req.body.eight,
      req.body.nine,
      req.body.ten,
      req.body.eleven,
      req.body.twelve,
      req.body.thirteen,
      req.body.fourteen
    ]
    console.log(indecision);
    const id = req.user.id;
    User.updateOne({ auth0Id: id }, { $push: { "indecision": indecision } })
    .then(result => {
      console.log('Update successful', result);
      res.redirect('/games');
    })
    .catch(error => {
      console.error('Error updating user', error);
      res.redirect('/games/indecision');
    });    
  } else {
    res.status(401).json({ error: 'User is not authenticated' });
  }
});

app.post('/updateData', (req, res) => {
  if (req.isAuthenticated()) {

      res.body = {'user': req.user, 'data': req.body}
      const id = req.user.id;
      User.updateOne({ auth0Id: id }, {$push: {"experiments.$.logJson": req.body}})
      .then(result => {
        console.log('Update successful', result);
        res.redirect('/games');
      })
      .catch(error => {
        console.error('Error updating user', error);
        res.redirect('/games');
      }); 
  } else {
      res.status(401).json({ error: 'User is not authenticated' });
  }
});


app.get('/games', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('games.ejs');
  } else {
    res.status(401).json({ error: 'User is not authenticated' });
  }
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
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



//============================================== All Auth0 Routes
// Auth0 login route
app.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), (req, res) => {
  res.redirect('/callback');
});

app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/login' }), async (req, res) => {
  try {
    // Await the response from findOne to check if user already exists
    const existingUser = await User.findOne({ auth0Id: req.user.id });

    if (existingUser) {
      // User already exists, so redirect to the games page
      res.redirect('games');
    } else {
      // User does not exist, create a new user
      const newUser = new User({
        auth0Id: req.user.id,
      });

      // Save the new user and then redirect
      await newUser.save();
      console.log('New user added:', newUser);
      res.redirect('games');
    }
  } catch (err) {
    console.log('Error during user lookup or creation:', err);
    res.status(500).send('An error occurred during user processing');
  }
});

app.get('/logout', (req, res) => {
  console.log("Logging out user...");
  req.logout(function (err) {
    if (err) { return next(err); }

    let returnTo = `${req.protocol}://${req.get('host')}`;
    const port = req.socket.localPort;
    if (port !== undefined && port !== 80 && port !== 443) {
      returnTo = process.env.NODE_ENV === 'production' ? returnTo : `${returnTo}:${port}`;
    }

    const logoutURL = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
    const searchString = new URLSearchParams({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString.toString();

    console.log("Redirecting to Auth0 logout URL:", logoutURL.toString());
    res.redirect(logoutURL.toString());
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));