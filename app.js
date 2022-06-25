const path = require('path')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const compression = require('compression')

const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')
const viewRouter = require('./routes/viewRoutes')
const globalErrorHandler = require('./controllers/errorController')

/* TODO: delete this later
const { testOrderCheckout } = require('./controllers/orderController')
*/

const app = express();

/* setting pug as view engine */
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

/* serving static files */
app.use(express.static(path.join(__dirname, 'public')))

if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'))
}

/* set security HTTP headers */
app.use(helmet())

/* limiting request from one IP */
const limiter = rateLimit({
   max: 200,
   windowMs: 60 * 60 * 1000,
   message: 'Too many requests from this IP, please try again in an hour!'
})

app.use('/api', limiter)


/* cross origin resource sharing */
app.use(cors({
   origin: 'http://localhost:3000',
   methods: ['GET', 'POST'],
   credentials: true
}))

/* body parser, reading data from body into req.body */
app.use(express.json({ limit: '200kb' }))
app.use(express.urlencoded({ extended: true, limit: '200kb' }))

/* data sanitization against NoSQL query injection */
app.use(mongoSanitize())

/* data sanitization against XSS */
app.use(xss())

/* prevent parameter pollution */
app.use(hpp({ whitelist: ['brand', 'price', 'size', 'tags'] }))

app.use(cookieParser())

app.use((req, res, next) => {
   res.set(
      'Content-Security-Policy',
      "script-src * self blob: ;"
   )
   res.set('Access-Control-Allow-Origin', 'http://localhost:3000')
   /* console.log(req.cookies.jwt) */
   next()
})

app.use(compression());

app.use('/', viewRouter)
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/orders', orderRouter)

/* TODO: delete this later
app.post('/test-order-checkout', testOrderCheckout)
*/

app.all('*', (req, res) => {
   res.status(200).render('error')
})

app.use(globalErrorHandler)

module.exports = app;