'use strict'

const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const crypto = require("node:crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER', // nen dung WRITER: '00001' de han che nguoi dung biet duoc role cua user
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'

}


class AccessService {
    /*
        1 - check email in dbs
        2 - match password
        3 - create AT vs RT and save
        4 - generate tokens
        5 - get data return logins
    */
    static login = async ({ email, password, refreshToken = null }) => {
        const foundShop = findByEmail({ email })
        if (!foundShop) throw new BadRequestError('shop not registered')

        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('password error')

        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        const tokens = await createTokenPair({ userId: foundShop._id, email }, publicKeyString, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
        })
        return {
            shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }
    }


    static signUp = async ({ name, email, password }) => {
        // try {
        const holderShop = await userModel.findOne({ email }).lean();
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered!')

        }
        const passwordHash = await bcrypt.hash(password, 10) //10: salt: do phuc tap cua ham bam
        const newShop = await userModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            //thuat toan bat doi xung with private key & public key
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1', //public key cryptoGraphy standard 1
            //         format: 'pem'  //pem: dinh dang de ma hoa data nhi phan
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1', //public key cryptoGraphy standard 1
            //         format: 'pem'  //pem: dinh dang de ma hoa data nhi phan
            //     }
            // })

            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')
            console.log({ privateKey, publicKey }) // save collection keyStore 

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })
            if (!keyStore) {
                throw new BadRequestError('Error: publicKeyString error!')
            }

            //created token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log(`created token success: `, tokens)
            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }

        }
        return {
            code: 200,
            metadata: null
        }
        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'
        //     }
        // }
    }
}

module.exports = AccessService