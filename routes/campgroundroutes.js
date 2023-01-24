const express = require('express');
const router = express.Router();
const asyncCatcher = require('../utils/asyncCatcher');
const { ensureLoggedIn, isAuthor, validateCampground } = require('../utils/middleware');
const Campground = require('../models/campground');
const campgroundControllers = require('../controllers/campgroundcontrollers');
const multer = require('multer');
const { storage } = require('../cloudinary/index')
const upload = multer({ storage });


router.route('/')
    // GET All Campgrounds
    .get(asyncCatcher(campgroundControllers.index))

    // POST New campground
    .post(ensureLoggedIn, upload.array('image'), validateCampground, asyncCatcher(campgroundControllers.createNewCampground))

    

// GET New campground form
router.get('/new', ensureLoggedIn, campgroundControllers.renderNewCampgroundForm);


router.route('/:id')
    // GET Show particular campground
    .get(asyncCatcher(campgroundControllers.showCampground))

    // PUT Edit campground
    .put(ensureLoggedIn, isAuthor, upload.array('image'), validateCampground, asyncCatcher(campgroundControllers.editCampground))

    // Delete campground
    .delete(ensureLoggedIn, isAuthor, asyncCatcher(campgroundControllers.deleteCampground))


// GET Edit campground form
router.get('/:id/edit', ensureLoggedIn, isAuthor, asyncCatcher(campgroundControllers.renderEditCampgroundForm));


module.exports = router;