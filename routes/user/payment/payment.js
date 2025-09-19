const express = require('express')
const router = express.Router()


const {getUserPayment, addUserPayment,updateUserPayment}  = require('../../../controllers/user.payment.js')

router.get('/',getUserPayment)
router.post('/add',addUserPayment)
router.put('/update',updateUserPayment)


module.exports = router