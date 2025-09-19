const express = require('express')
const router = express.Router()

const {returantOrdersStream}= require('../../controllers/notfications')

router.get('/:restaurant_id/orders',returantOrdersStream)

module.exports = router