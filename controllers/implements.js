const Implement = require("../models/implement");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const implements = await Implement.find({}).populate("popupText");
  res.render("implements/index", { implements });
};
module.exports.indexx = async (req, res) => {
  const implements = await Implement.find({}).populate("popupText");
  const loggedInUser = req.user._id;
  res.render("implements/orders", { implements, loggedInUser });
};

module.exports.renderNewForm = (req, res) => {
  res.render("implements/new");
};

module.exports.createImplement = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.implement.location,
      limit: 1,
    })
    .send();
  const implement = new Implement(req.body.implement);
  implement.geometry = geoData.body.features[0].geometry;
  implement.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  implement.author = req.user._id;
  await implement.save();
  console.log(implement);
  req.flash("success", "Successfully made a new Product available!");
  res.redirect(`/implements/${implement._id}`);
};
module.exports.createImplementt = async (req, res, next) => {
  res.redirect("/implements/orders");
};

module.exports.showImplement = async (req, res) => {
  const implement = await Implement.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!implement) {
    req.flash("error", "Cannot find that Product!");
    return res.redirect("/implements");
  }
  res.render("implements/show", { implement });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const implement = await Implement.findById(id);
  if (!implement) {
    req.flash("error", "Cannot find that Product!");
    return res.redirect("/implements");
  }
  res.render("implements/edit", { implement });
};

module.exports.updateImplement = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const implement = await Implement.findByIdAndUpdate(id, {
    ...req.body.implement,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  implement.images.push(...imgs);
  await implement.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await implement.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated Product!");
  res.redirect(`/implements/${implement._id}`);
};
module.exports.renderBuyNow = async (req, res) => {
  const { id } = req.params;
  const loggedInUser = req.user._id;
  console.log(req.body);
  //  product ki id = req.params se aa rahi h
  const implement = await Implement.findByIdAndUpdate(id, {
    ...req.body.implement,
    PurchasedId: loggedInUser,
  });
  const PurchasedId = implement.PurchasedId;
  await implement.save();

  req.flash("success", "Successfully purchased the Product!");
  res.redirect("/implements/orders");
  // res.render("implements/orders", { implements, loggedInUser });
};

module.exports.deleteImplement = async (req, res) => {
  const { id } = req.params;
  await Implement.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted Product");
  res.redirect("/implements");
};
