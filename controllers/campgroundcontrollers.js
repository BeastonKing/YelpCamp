const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/index');

const mboxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mboxGeocoding({ accessToken: process.env.MAPBOX_TOKEN })

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewCampgroundForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createNewCampground = async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Input', 400);

    // const { title, location, price, description, image } = req.body.campground;
    // const newCampground = new Campground({title, location, description, image, price});
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send()

    const newCampground = new Campground(req.body.campground);
    if (geodata.body.features.length > 0) {
        newCampground.geometry = geodata.body.features[0].geometry;
        newCampground.images = req.files.map(img => ({ url: img.path, filename: img.filename }));
        newCampground.author = req.user._id;
        await newCampground.save();
        req.flash('success', 'Campground has been succesfully created!')
        res.redirect(`/campgrounds/${newCampground._id}`);
    } else {
        newCampground.geometry = { type: 'Point', coordinates: [ 135.770134, 35.008715 ] }
        newCampground.images = req.files.map(img => ({ url: img.path, filename: img.filename }));
        newCampground.author = req.user._id;
        await newCampground.save();
        req.flash('error', 'Location Cannot Be Found. Default Location was Used Instead. Edit Campground Locations And Follow This Format "City, Province""');
        res.redirect(`/campgrounds/${newCampground._id}`);
    }
}

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campgroundById = await Campground.findById(id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');


    if (!campgroundById) {
        req.flash('error', 'Campground is not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground: campgroundById });
}

module.exports.renderEditCampgroundForm = async (req, res) => {
    const { id } = req.params;
    const campgroundById = await Campground.findById(id);
    if (!campgroundById) {
        req.flash('error', 'Campground is not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground: campgroundById });
}

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const updatedCampground = await Campground.findByIdAndUpdate(id, req.body.campground);
    const geodata = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1,
    }).send()

    if (geodata.body.features.length) {
        updatedCampground.geometry = geodata.body.features[0].geometry;
    } else updatedCampground.geometry = { type: 'Point', coordinates: [ 135.770134, 35.008715 ] }

    if (req.files) {
        const newImages = req.files.map(img => ({ url: img.path, filename: img.filename }))
        updatedCampground.images.push(...newImages);
    }
    await updatedCampground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Campground has been succesfully updated!')

    return res.redirect(`/campgrounds/${updatedCampground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground has been succesfully deleted!')
    res.redirect('/campgrounds');
}