// const fetch = require("node-fetch");
const mapKey = process.env.MAP_API_KEY;
const Listing = require("../models/listing");


module.exports.index = async (req,res,next) => {
    const { category } = req.query;
    let filter = {};
    if(category){
        filter.category = category;
    }
    
    const allListings = await Listing.find(filter);
    res.render("listings/index", { allListings, currCategory: category || "" });
 
};

module.exports.renderNewForm =   (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showNewListing =  async (req,res,next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
        populate: {
            path: "author",
        }
    })
    .populate("owner");
    
    if(!listing){
        req.flash("error", "Listing you requested for does not exist.");
        return res.redirect("/listings"); //writing return here is important as we are using two req.render and req.redirect , if we don't write it , then error will occur.
    };

    res.render("listings/show.ejs", {listing });
};

// module.exports.createListing = async (req,res,next) => {
//         let url = req.file.path;
//         let filename = req.file.filename;
//         console.log(url , ".." , filename);

//         const newListing = new Listing(req.body.listing);
//         console.log(req.user);
//         newListing.owner = req.user._id;
//         newListing.image = {url , filename};
//         await newListing.save();
//         req.flash("success", "New Listing Created!");
//         res.redirect("/listings");
 
// };

module.exports.createListing = async (req,res,next) => {
    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    let location = req.body.listing.location;

    const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${mapKey}`
    );

    const data = await response.json();

    if(!data.features.length){
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    let coordinates = data.features[0].center;
    console.log(coordinates);

    newListing.owner = req.user._id;
    newListing.image = {url , filename};
    newListing.geometry = {
        type: "Point",
        coordinates: coordinates
    };

    let savedListing = await newListing.save();
    console.log(savedListing);

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res,next) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
      if(!listing){
        req.flash("error", "Listing you requested for does not exist.");
        return res.redirect("/listings"); //writing return here is important as we are using two req.render and req.redirect , if we don't write it , then error will occur.
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", {listing , originalImageUrl });
};

module.exports.updateListing = async (req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url , filename };
    await listing.save();
    };

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req,res,next) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};