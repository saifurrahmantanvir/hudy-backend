const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Order = require('../model/orderModel');
const User = require('../model/userModel');
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync');


exports.getCheckoutSession = catchAsync(async (req, res, next) => {
   const { cart: { products } } = req.body

   let id = '';
   const lineItems = products.map((product, i) => {
      const { name, price, image, quantity, _id } = product

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
         images: [image],
         quantity: quantity
      }
   })

   const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: 'https://hudy-tanvir.netlify.app/cart/success',
      customer_email: req.user.email,
      line_items: lineItems,
      client_reference_id: id,
      cancel_url: 'https://hudy-tanvir.netlify.app/cart/cancel'
   })

   res.status(200).json({ status: 'success', session })
})

const createOrderCheckout = async (session, res) => {
   const _ids = session.client_reference_id.split('_')
   const user = (await User.findOne({ email: session.customer_email })).id

   let _amount = 0;
   const products = session.display_items.map(({ amount, quantity }, i) => {
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

exports.webhookCheckout = catchAsync(async (req, res, next) => {
   const signature = req.headers['stripe-signature'];

   let event;

   try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
   }
   catch (error) {
      return res.status(400).send(`Webhook Error ${error.message}`)
   }

   if (event.type = 'checkout.session.completed') {
      createOrderCheckout(event.data.object)
   }

   res.status(200).json({ received: true })
})


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