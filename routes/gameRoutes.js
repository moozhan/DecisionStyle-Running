if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const Auth0Strategy = require('passport-auth0');
const cookieParser = require('cookie-parser');
const passport = require('passport');


const router = express.Router();


router.use(cors({
    origin: ['https://lazy-puce-tortoise-yoke.cyclic.app', 'https://moozhan.github.io', 'https://dev-backend.d4id81j7108zr.amplifyapp.com', 'https://7rh93fhc7e.execute-api.eu-central-1.amazonaws.com'], // Update with the location of your HTML file
    credentials: true
}));
router.use(cookieParser());

router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true, // Should be true in production when using HTTPS
        sameSite: 'None' // Can be strict or lax depending on your requirements
    }
}));


router.post('/updateData', (req, res) => {
    if (req.isAuthenticated()) {
        res.body = {'user': req.user, 'data': req.body}
    } else {
        res.status(401).json({ error: 'User is not authenticated' });
    }
});


