const express = require('express');
const router = express.Router({mergeParams: true});
const asyncCatcher = require('../utils/asyncCatcher');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {ensureLoggedIn, isReviewAuthor, validateCampground, validateReview} = require('../utils/middleware');
const reviewControllers = require('../controllers/reviewcontrollers');



router.post('/', ensureLoggedIn, validateReview, asyncCatcher(reviewControllers.createNewReview));

router.delete('/:reviewId', ensureLoggedIn, isReviewAuthor, asyncCatcher(reviewControllers.deleteReview));

module.exports = router;