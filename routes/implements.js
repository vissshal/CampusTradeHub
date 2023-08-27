const express = require("express");
const router = express.Router();
const implements = require("../controllers/implements");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateImplement } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Implement = require("../models/implement");

router
  .route("/")
  .get(catchAsync(implements.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateImplement,
    catchAsync(implements.createImplement)
  );
router
  .route("/orders")
  .get(catchAsync(implements.indexx))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateImplement,
    catchAsync(implements.createImplement)
  );

router.get("/new", isLoggedIn, implements.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(implements.showImplement))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateImplement,
    catchAsync(implements.updateImplement)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(implements.deleteImplement));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(implements.renderEditForm)
);

router.get("/:id/buy", isLoggedIn, catchAsync(implements.renderBuyNow));
module.exports = router;
