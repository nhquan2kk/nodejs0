'use strict'

const JWT = require('jsonwebtoken')
const { asyncHandler } = require('../helpers/asyncHandler')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: '    '
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = await JWT.sign(payload, privateKey, {
            expiresIn: '2 days'
        })
        const refreshToken = await JWT.sign(payload, privateKey, {
            expiresIn: '7 days'
        })

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) {
                console.error('verify error: ', err)
            } else {
                console.log(`decode verify: `, decode)
            }
        })

        return { accessToken, refreshToken }
    } catch (error) {
        return error
    }
}

const authentication = asyncHandler(async (req, res, next) => {
    /*
        1 - check userID co missing hay ko 
        2 - get accessToken
        3 - verify token
        4 - check user in dbs
        5 - check keyStore with this userId
        6 - ok all => return next()
    */

    //1.
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid request')
    //2.
    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not found key store')
    //3.
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (accessToken) throw new AuthFailureError('Invalid Request')

    try {
        const decodeUser = JWT.verify(accessToken, keyStore.publicKey)
        if (userId !== decodeUser.userId) throw new AuthFailureError('Invalid userId')
        req.keyStore = keyStore
        return next()
    } catch (error) {
        throw error
    }
})

module.exports = {
    createTokenPair,
    authentication
}