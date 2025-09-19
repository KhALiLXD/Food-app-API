const express = require('express')
const router = express.Router()


const {notificationStream,publishBroadcast}  = require('../../controllers/notfications')

router.get('/stream',notificationStream)
router.post('/broadcast',publishBroadcast)

module.exports = router;