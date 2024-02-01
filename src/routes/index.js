'use strict'

const express = require('express')
const { apiKey, permisson } = require('../auth/checkAuth')
const router = express.Router()


//check apiKey
router.use(apiKey)

//checkPermisson
router.use(permisson('0000'))


router.use('/v1/api', require('./access'))


// router.get('/', (req, res, next) => {
//     return res.status(200).json({
//         message: 'Welcome to nodejs'
//     })
// })

module.exports = router