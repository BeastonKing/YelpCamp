const express = require('express');
const router = express.Router();
const asyncCatcher = require('../utils/asyncCatcher');
const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');
const passport = require('passport');
const { ensureNotAlreadyLoggedIn, ensureNotAlreadyLoggedOut } = require('../utils/middleware');
const userControllers = require('../controllers/usercontrollers');


router.route('/register')
    .get(ensureNotAlreadyLoggedIn, userControllers.renderRegisterForm)
    .post(asyncCatcher(userControllers.register))

    
router.route('/login')
    .get(ensureNotAlreadyLoggedIn, userControllers.renderLoginForm)
    .post(ensureNotAlreadyLoggedIn, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), userControllers.login)

router.get('/logout', ensureNotAlreadyLoggedOut, userControllers.logout)

module.exports = router;