const express = require('express')

const {
   getCheckoutSession,
   getAllOrders,
   getOrder,
   createOrder,
   updateOrder,
   deleteOrder
} = require('../controllers/orderController')
const {
   protect,
   isAdmin
} = require('../controllers/authenticationController')

const router = express.Router()

router.post('/checkout-session', protect, getCheckoutSession)

router.use(protect, isAdmin)

router.route('/')
   .get(getAllOrders)
   .post(createOrder)

router.route('/:id')
   .get(getOrder)
   .patch(updateOrder)
   .delete(deleteOrder)

module.exports = router;