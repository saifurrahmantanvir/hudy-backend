const multer = require('multer')
const sharp = require('sharp')
const slugify = require('slugify')

const Product = require('../model/productModel')
const apiFeatures = require('../utils/apiFeatures')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image')) {
      cb(null, true)
   } else {
      cb(new AppError('Not an image! Please upload only image', 400), false)
   }
}

const upload = multer({
   storage: multerStorage,
   fileFilter: multerFilter
})

exports.uploadImage = upload.single('image')


exports.resizeImage = catchAsync(async (req, res, next) => {
   if (!req.file) return next()

   const slug = slugify(`${req.body.name}`, { lower: true })

   req.file.filename = `product-${slug}.jpeg`

   await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/img/products/${req.file.filename}`)

   next()
})

exports.getAllProducts = catchAsync(async (req, res, next) => {
   const query = apiFeatures(req, Product)
   const products = await query;

   res.status(200).json({
      status: 'success',
      results: products.length,
      data: {
         products
      }
   })
})

exports.getProduct = catchAsync(async (req, res, next) => {
   const { slug } = req.params
   const product = await Product.findOne({ slug }).populate('reviews')

   if (!product) {
      return next(new AppError('No product found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         product
      }
   })
})

exports.createProduct = catchAsync(async (req, res, next) => {
   if (req.file)
      req.body.image = `https://hudy-tanvir.herokuapp.com/img/products/${req.file.filename}`

   const fields = ['size', 'tags']

   fields.forEach((key) => {
      req.body[key] = JSON.parse(req.body[key])
   })

   const newProduct = await Product.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         product: newProduct
      }
   })
})

exports.updateProduct = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!product) {
      return next(new AppError('No product found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         product
      }
   })
})

exports.deleteProduct = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const product = await Product.findByIdAndDelete(id)

   if (!product) {
      return next(new AppError('No product found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         product
      }
   })
})