const express = require('express')
const router = express.Router()

const {driverLocationStream, updateDriverLocation} = require('../../controllers/driver')

router.get('/:driverId/order-tracking',driverLocationStream)
router.put('/update-location',updateDriverLocation)


module.exports = router