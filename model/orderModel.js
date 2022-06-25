const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'An order must belong to a user!']
   },
   products: [{
      product: {
         type: mongoose.Schema.ObjectId,
         ref: 'Product',
         required: [true, 'No product Id found']
      },
      quantity: {
         type: Number,
         default: 1
      },
      price: {
         type: Number,
         default: 0
      }
   }],
   amount: {
      type: Number,
      required: [true, 'An order must have price']
   }
}, {
   timestamps: true
})

orderSchema.pre(/^find/, function (next) {
   this.populate({
      path: 'user',
      select: 'name email'
   }).populate({
      path: 'products.product',
      select: 'name image'
   })

   next()
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order;