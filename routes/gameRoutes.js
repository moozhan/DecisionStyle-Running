const cors = require('cors');
const cookieParser = require('cookie-parser');
const User = require('../models/user');

const router = express.Router();


router.use(cors({
    origin: ['https://lazy-puce-tortoise-yoke.cyclic.app', 'https://moozhan.github.io', 'https://dev-backend.d4id81j7108zr.amplifyapp.com', 'https://7rh93fhc7e.execute-api.eu-central-1.amazonaws.com'], // Update with the location of your HTML file
    credentials: true
}));
router.use(cookieParser());

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
  

router.post('/updateData', (req, res) => {
    if (req.isAuthenticated()) {

        res.body = {'user': req.user, 'data': req.body}
        const id = req.user.id;
        User.updateOne({ auth0Id: id }, {$push: {"experiments.$.logJson": req.body}});
    } else {
        res.status(401).json({ error: 'User is not authenticated' });
    }
});

module.exports = router;