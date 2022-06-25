const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Order = require('../model/orderModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync');

/* TODO: need to change */
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
   const { cart: { products } } = req.body

   let id = '';
   const lineItems = products.map((product, i) => {
      const { name, price, quantity, _id } = product

      if (i === 0) {
         id += _id
      }
      else {
         id += `_${_id}`
      }

      return {
         currency: 'usd',
         amount: price * 100 / quantity,
         name,
         /* TODO: need to change */
         images: ['https://cf.shopee.ph/file/daf62f659c92f0a5a9be20740e3f9b0c'],
         quantity: quantity
      }
   })

   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      /* TODO: need to change */
      success_url: `${process.env.CLIENT_URL}/cart/success`,
      cancel_url: `${process.env.CLIENT_URL}/cart/cancel`,
      customer_email: req.user.email,
      line_items: lineItems,
      client_reference_id: id
   })

   res.status(200).json({ status: 'success', session })
})

/* TODO: need to change when deployed */
const createOrderCheckout = async (session, res) => {
   const _ids = session.client_reference_id.split('_')
   const user = (await User.findOne({ email: session.customer_email })).id

   let _amount = 0;
   const products = session.line_items.map(({ amount, quantity }, i) => {
      _amount = _amount + amount;

      return {
         product: _ids[i],
         quantity,
         price: amount / 100
      }
   })

   await Order.create({ user, products, amount: _amount / 100 })

   res.status(201).json({
      status: 'success',
      message: 'Order completed successfully!'
   })
}

/* TODO: need to change/delete when deployed */
exports.testOrderCheckout = (req, res, next) => {
   createOrderCheckout({
      id: "cs_test_b1QweKmrym8LZSPytZcObLFox5FCrG5NBSs4w3RJ8hXYXthICu9PW9DD85",
      line_items: [
         {
            currency: 'usd',
            amount: 88000,
            name: "Closet's Hoodie CH21",
            images: ['https://cf.shopee.ph/file/daf62f659c92f0a5a9be20740e3f9b0c'],
            quantity: 2
         },
         {
            currency: 'usd',
            amount: 60000,
            name: "Closet's Hoodie CH24",
            images: ['https://cf.shopee.ph/file/daf62f659c92f0a5a9be20740e3f9b0c'],
            quantity: 2
         }
      ],
      amount_total: 704000,
      billing_address_collection: null,
      cancel_url: "http://localhost:3000/cart",
      client_reference_id: '62a767dee587030a7a0b46de_62a769d2e587030a7a0b46eb',
      currency: "usd",
      customer_email: "hello@tanvir.io",
      mode: "payment",
      payment_intent: "pi_3LCPneF1Os0hWe6B1AoqOj5P",
      payment_method_options: {},
      payment_method_types: [
         "card"
      ],
      payment_status: "paid",
      status: "complete",
      success_url: "http://localhost:3000/cart",
   }, res)
}

exports.getAllOrders = catchAsync(async (req, res, next) => {
   const orders = await Order.find();

   res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
         orders
      }
   })
})

exports.getOrder = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const order = await Order.findById(id)

   if (!order) {
      return next(new AppError('No order found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         order
      }
   })
})

exports.createOrder = catchAsync(async (req, res, next) => {
   const newOrder = await Order.create(req.body)

   res.status(201).json({
      status: 'success',
      data: {
         order: newOrder
      }
   })
})

exports.updateOrder = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const order = await Order.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   })

   if (!order) {
      return next(new AppError('No order found with that ID', 404))
   }

   res.status(200).json({
      status: 'success',
      data: {
         order
      }
   })
})

exports.deleteOrder = catchAsync(async (req, res, next) => {
   const { id } = req.params
   const order = await Order.findByIdAndDelete(id)

   if (!order) {
      return next(new AppError('No order found with that ID', 404))
   }

   res.status(204).json({
      status: 'success',
      data: {
         order
      }
   })
})