const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createNewReview = async (req, res) => {
    const { id } = req.params;
    // const {body, rating} = req.body.review;
    const camp = await Campground.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    req.flash('success', 'Review has been succesfully added!')
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;

    const camp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    const review = await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review has been succesfully deleted!')
    res.redirect(`/campgrounds/${camp._id}`);
}