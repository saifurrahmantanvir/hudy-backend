const express = require('express')

const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const {
   getAllProducts,
   uploadImage,
   resizeImage,
   getProduct,
   createProduct,
   updateProduct,
   deleteProduct
} = require('../controllers/productController')

const router = express.Router()

router.route('/')
   .get(getAllProducts)
   .post(
      protect,
      isAdmin,
      uploadImage,
      resizeImage,
      createProduct
   )

router.route('/:slug')
   .get(getProduct)

router.use(protect, isAdmin)

router.route('/:id')
   .patch(updateProduct)
   .delete(deleteProduct)

module.exports = router;