const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const axios = require('axios');

mongoose.set('strictQuery', false);

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once('open', () => {
    console.log("Mongo database connected");
});

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedImg = async () => {
    try {
        const resp = await axios.get('https://api.unsplash.com/photos/random', {
            params: {
                client_id: '_vkpmkgV_izPdh9JFiolsFPSdcXsucy6WuUfJLyeqFw',
                collections: 1114848,
            },
        })
        return resp.data.urls.small;
    } catch (error) {
        console.error(error);
    }
}

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randCity = Math.floor(Math.random() * 1000);
        const randPrice = Math.floor(Math.random() * 30) + 10;
        await new Campground({
            images: [
                {
                  url: 'https://res.cloudinary.com/dfq6satrv/image/upload/v1674470107/YelpCampImages/308658080_1664715013925728_8098171142735501525_n_gfxo7b.jpg',
                  filename: 'YelpCampImages/308658080_1664715013925728_8098171142735501525_n_gfxo7b',
                },
              ],
            location: `${cities[randCity].city}, ${cities[randCity].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi atque cupiditate officia asperiores repudiandae voluptatibus tempore assumenda, suscipit accusantium. Eveniet amet expedita exercitationem officiis qui aliquam, animi odit nam perferendis.',
            price: randPrice,
            geometry: { type: 'Point', coordinates: [ cities[randCity].longitude, cities[randCity].latitude ] },




            author: '63ca49e23d485469ce94ffb6',
        }).save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});