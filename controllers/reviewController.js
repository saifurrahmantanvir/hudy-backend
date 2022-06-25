const Review = require("../model/reviewModel")
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

exports.getAllReviews = catchAsync(async (req, res, next) => {
   const reviews = await Review.find()

   res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
         reviews
      }
   })
})

exports.getReview = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const review = await Review.findById(id)

   if (!review) {
      return next(new AppError('No review found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         review
      }
   })
})

exports.createReview = catchAsync(async (req, res, next) => {
   const newReview = await Review.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         review: newReview
      }
   })
})

exports.updateReview = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const review = await Review.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!review) {
      return next(new AppError('No review found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         review
      }
   })
})

exports.deleteReview = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const review = await Review.findByIdAndDelete(id)

   if (!review) {
      return next(new AppError('No review found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         review
      }
   })
})