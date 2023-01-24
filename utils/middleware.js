const Campground = require('../models/campground')
const Review = require('../models/review');
const { CampgroundValidationSchema, ReviewValidationSchema } = require('./validationSchema');
const ExpressError = require('../utils/ExpressError');
const asyncCatcher = require('../utils/asyncCatcher');

module.exports.ensureLoggedIn = (req, res, next) => {
    const { id } = req.params;
    if (!req.isAuthenticated()) {
        req.session.returnTo = (req.query._method === 'DELETE' ? `/campgrounds/${id}` : req.originalUrl);
        // req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to use this feature!');
        return res.redirect('/login')
    } else next();
}

module.exports.ensureNotAlreadyLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.flash('error', 'You are already logged in.');
        return res.redirect('/campgrounds');
    } else next();
}

module.exports.ensureNotAlreadyLoggedOut = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You are already logged out.');
        return res.redirect('/campgrounds');
    } else next();
}

// Campground author validation
module.exports.isAuthor = asyncCatcher(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You don\'t have permission to do that!');
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    next();
})

// Review author validation
module.exports.isReviewAuthor = asyncCatcher(async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // const campground = await Campground.findById(id);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You don\'t have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
})

// Campground validation middleware
module.exports.validateCampground = (req, res, next) => {

    const { error } = CampgroundValidationSchema.validate(req.body);
    if (error) {
        const errorMap = error.details.map(e => e.message).join(',');
        throw new ExpressError(errorMap, 400);
    } else return next();
}

// Review validation middleware
module.exports.validateReview = (req, res, next) => {
    const { error } = ReviewValidationSchema.validate(req.body);
    if (error) {
        const errorMap = error.details.map(e => e.message).join(',');
        throw new ExpressError(errorMap, 400);
    } else return next();
}