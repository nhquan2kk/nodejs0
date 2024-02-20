'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()

//SignUp
router.post('/shop/signup', asyncHandler(accessController.signUp))
//login
router.post('/shop/login', asyncHandler(accessController.login))
//logout
router.post('/shop/logout', asyncHandler(accessController.logout))

/////Authentication
router.use(authentication)

module.exports = router