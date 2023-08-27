const Implement = require('../models/implement');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const implement = await Implement.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    implement.reviews.push(review);
    await review.save();
    await implement.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/implements/${implement._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Implement.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/implements/${id}`);
}
