const express = require('express')
const router = express.Router()

const {orderStatusStream,getOrderDetails,createOrder}= require('../../../controllers/order')

router.get('/:orderId/order-status',orderStatusStream)
router.get('/:orderId',getOrderDetails)
router.post('/create', createOrder)

module.exports = router