const express = require('express')
const { protect } = require('../controllers/authenticationController')
const {
   getAllReviews,
   getReview,
   createReview,
   updateReview,
   deleteReview
} = require('../controllers/reviewController')

const router = express.Router()

router.route('/')
   .get(getAllReviews)
   .post(protect, createReview)

router.route('/:id')
   .get(getReview)
   .patch(protect, updateReview)
   .delete(protect, deleteReview)

module.exports = router;