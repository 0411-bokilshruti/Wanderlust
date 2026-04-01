const mongoose = require("mongoose");
const initData = require("./data.js");
const axios = require("axios");
const Listing = require("../models/listing.js");
require("dotenv").config({ path: "../.env" });

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

main()
.then(() => {
    console.log("Connected to DB..");
})
.catch((err) => {
    console.log("Error in database.")
});

async function main() {
    await mongoose.connect(MONGO_URL);
};

const getCoordinates = async (location) => {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.MAP_API_KEY}`;
    const response = await axios.get(url);
    return response.data.features[0].geometry;
};

const initDB = async () => { 
    try{
    await Listing.deleteMany({});
    // initData.data = initData.data.map(
    //     (obj) => (
    //         {...obj,
    //         owner: "69c5fb807e86f70540adbeb3",
    //         }));  
    

    for (let obj of initData.data) {
        obj.owner = "69c5fb807e86f70540adbeb3";
        obj.geometry = await getCoordinates(obj.location);
        // const newListing = new Listing(obj);
        // await newListing.save();
    };

    await Listing.insertMany(initData.data);
    console.log("Data was intialized.");
} catch(e) {
    console.log("Error: ", e.message);
}
}

initDB();