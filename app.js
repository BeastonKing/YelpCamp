if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const databaseUrl = process.env.MONGO_ATLAS_URL || 'mongodb://127.0.0.1:27017/yelpcamp';

const campgroundRoutes = require('./routes/campgroundroutes');
const reviewRoutes = require('./routes/reviewroutes');
const userRoutes = require('./routes/userRoutes');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const passport = require('passport');
const passportLocalStrategy = require('passport-local');
const User = require('./models/user');


// Mongoose
mongoose.set('strictQuery', false);
// main().catch(err => {
//     console.log("Error when connecting to mongo!");
//     console.log(err);
// });

// async function main() {
//     await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
//     console.log('Mongo connection open!')
// }

mongoose.connect(databaseUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once('open', () => {
    console.log("Mongo database connected");
});



// Sets and Uses
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
// app.use(helmet()); //including this breaks the CSP
 
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dfq6satrv/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dfq6satrv/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dfq6satrv/" ];
 
app.use(
    helmet({
        contentSecurityPolicy: {
            directives : {
                defaultSrc : [],
                connectSrc : [ "'self'", ...connectSrcUrls ],
                scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
                styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
                workerSrc  : [ "'self'", "blob:" ],
                objectSrc  : [],
                imgSrc     : [
                    "'self'",
                    "blob:",
                    "data:",
                    "https://res.cloudinary.com/dfq6satrv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                    "https://images.unsplash.com/"
                ],
                fontSrc    : [ "'self'", ...fontSrcUrls ],
                mediaSrc   : [ "https://res.cloudinary.com/dfq6satrv/" ],
                childSrc   : [ "blob:" ]
            }
        },
        crossOriginEmbedderPolicy: false,
    })
);

const secret = process.env.SECRET || 'tempsecrets';
const store = new MongoStore({
    url: databaseUrl,
    secret: secret,
    touchAfter: 24 * 3600
});

store.on('error', function(e) {
    console.log('Store Session Error', e);
})

const sessionConfiguration = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'userSession',
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfiguration))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    // console.log(req.session)
    next();
})

app.get('/', (req, res) => {
    res.render('home');
});


// User Routes
app.use('/', userRoutes);

// Campgrounds Routes
app.use('/campgrounds', campgroundRoutes);

// Review Routes
app.use('/campgrounds/:id/reviews', reviewRoutes);


// app.post('/campgrounds/:id/reviews', validateReview, asyncCatcher(async (req, res) => {
//     const { id } = req.params;
//     // const {body, rating} = req.body.review;
//     const camp = await Campground.findById(id);
//     const newReview = new Review(req.body.review);
//     camp.reviews.push(newReview);
//     await newReview.save();
//     await camp.save();
//     res.redirect(`/campgrounds/${camp._id}`);
// }));

// app.delete('/campgrounds/:campId/reviews/:reviewId', asyncCatcher(async (req, res) => {
//     const {campId, reviewId} = req.params;

//     const camp = await Campground.findByIdAndUpdate(campId, {$pull: {reviews: reviewId}});
//     const review = await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/campgrounds/${camp._id}`);
// }));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Yikes, Something Went Wrong!';
    res.status(statusCode).render('errors/errorTemplate', { err });
});

app.listen(port, () => {
    console.log('APP IS LISTENING ON PORT', port);
});

