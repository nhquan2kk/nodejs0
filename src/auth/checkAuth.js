'use strict'

const { findById } = require("../services/apiKey.service")

const HEADER = {
    API_KEY: 'x-api-key',
    AUTHORIZATION: 'authorization'
}

const apiKey = async (req, res, next) => {
    try {
        const key = req.headers[HEADER.API_KEY]?.toString()
        if (!key) {
            return res.status(403).json({
                message: 'Forbidden error'
            })
        }
        //check objKey
        const objKey = await findById(key)
        if (!objKey) {
            return res.status(403).json({
                message: 'Forbidden error'
            })
        }
        req.objKey = objKey
        return next()

    } catch (error) {

    }
}

const permisson = (permisson) => {
    return (req, res, next) => {
        if (!req.objKey.permissons) {
            return res.status(403).json({
                message: 'permisson denined'
            })
        }

        console.log('permisson:', req.objKey.permissons)
        const validPermisson = req.objKey.permissons.includes(permisson)
        if (!validPermisson) {
            return res.status(403).json({
                message: 'permisson denined'
            })
        }

        return next()
    }
}



module.exports = {
    apiKey,
    permisson
}