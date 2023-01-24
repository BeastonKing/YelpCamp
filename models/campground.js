const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const {cloudinary} = require('../cloudinary/index');

const opts = {toJSON: {virtuals: true}};

const ImageSchema = new Schema({
    url: String,
    filename: String,
});
// 'https://res.cloudinary.com/dfq6satrv/image/upload/v1674383461/YelpCampImages/ndrwpln9gz8ovvknrvod.jpg'
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

ImageSchema.virtual('croppedImage').get(function() {
    return this.url.replace('/upload', '/upload/ar_4:3,c_crop');
})


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, opts);

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc.reviews) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }

    if (doc.images) {
        for (let img of doc.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
})

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `
    <a href="/campgrounds/${this._id}">${this.title}</a><p>Price: ${this.price}$ / night</p>`;
})
module.exports = mongoose.model('Campground', CampgroundSchema);