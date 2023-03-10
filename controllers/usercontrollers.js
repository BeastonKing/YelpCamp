const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', `Welcome to YelpCamp, ${registeredUser.username}!`);
            res.redirect('/campgrounds');
        });
        
    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }

}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete res.locals.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) return next(err);
        else {
            req.flash('success', 'You have logged out!')
            res.redirect('/campgrounds');
        }
    });
}