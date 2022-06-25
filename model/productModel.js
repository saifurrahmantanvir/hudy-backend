const mongoose = require('mongoose')
const slugify = require('slugify')

const productSchema = new mongoose.Schema({
   name: {
      type: String,
      unique: true,
      required: [true, 'A product must have a name']
   },
   brand: {
      type: String,
      required: [true, 'A product must belong to a brand']
   },
   image: {
      type: String,
      required: [true, 'A product must have an image']
   },
   slug: String,
   price: {
      type: Number,
      required: [true, 'A product must have a price']
   },
   discount: {
      type: Number,
      validate: {
         validator: function (val) {
            return val < this.price;
         },
         message: 'Discount price ({VALUE}) should be below regular price'
      }
   },
   inStock: {
      type: Number,
      default: 1
   },
   size: {
      type: [String],
      default: ['L'],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
   },
   description: {
      type: String,
      required: [true, 'Description can\'t be empty!']
   },
   tags: [String],
   ratingsAverage: {
      type: Number,
      default: 0
   },
   ratingsQuantity: {
      type: Number,
      default: 0
   },
   createdAt: {
      type: Date,
      default: Date.now(),
      select: false
   },
   /* reviews: Array */
}, {
   toJSON: { virtuals: true },
   toObject: { virtuals: true }
})

productSchema.pre('save', function (next) {
   this.slug = slugify(this.name, { lower: true })

   next()
})

productSchema.virtual('reviews', {
   ref: 'Review',
   foreignField: 'product',
   localField: '_id'
})

/* DATA MODELLING - EMBEDDING --->
productSchema.pre('save', async function (next) {
   const reviewsPromises = this.reviews.map(async (id) =>
      await Review.findById(id)
   )

   this.reviews = await Promise.all(reviewsPromises)
   next()
})
*/

/* CHILD REFERENCING - STEP 1-2 --->
reviews: {
   type: mongoose.Schema.ObjectId,
   ref: 'Review'
}

DATA MODELLING - CHILD REFERENCING - STEP 2-2 --->
productSchema.pre(/^find/, function (next) {
   this.populate({      // this points to the current query
      path: 'reviews',
      select: 'review user'
   })

   next()
})
*/

const Product = mongoose.model('Product', productSchema)

module.exports = Product;