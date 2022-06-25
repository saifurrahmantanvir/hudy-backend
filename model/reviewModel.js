const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
   review: {
      type: String,
      required: [true, 'Review can not be empty!']
   },
   product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product']
   },
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
   },
   createdAt: {
      type: Date,
      default: Date.now()
   }
}, {
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
})

reviewSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'user',
      select: 'name'
   })

   next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review;