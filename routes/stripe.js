const express = require('express')
const router = express.Router()
const {authCheck,adminCheck} = require('../middlewares/authCheck')

const {changeOrderStatus,listOrder} = require('../controllers/admin')
const { payment } = require('../controllers/stripe')

router.post('/user/creat-payment-intent',authCheck,payment)

module.exports = router