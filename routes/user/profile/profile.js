const express = require('express')
const router = express.Router()


const {getUserProfile, updateUserProfile}  = require('../../../controllers/user.profile')

router.get('/',getUserProfile)
router.put('/',updateUserProfile)


module.exports = router