'use strict'

const userModel = require("../models/user.model")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { BadRequestError } = require("../core/error.response")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER', // nen dung WRITER: '00001' de han che nguoi dung biet duoc role cua user
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'

}


class AccessService {
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
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1', //public key cryptoGraphy standard 1
                    format: 'pem'  //pem: dinh dang de ma hoa data nhi phan
                },
                privateKeyEncoding: {
                    type: 'pkcs1', //public key cryptoGraphy standard 1
                    format: 'pem'  //pem: dinh dang de ma hoa data nhi phan
                }
            })
            console.log({ privateKey, publicKey }) // save collection keyStore 

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey
            })
            if (!publicKeyString) {
                throw new BadRequestError('Error: publicKeyString error!')
            }
            const publicKeyObject = crypto.createPublicKey(publicKeyString)
            //created token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKeyString, privateKey)
            console.log(`created token success: `, tokens)
            return {
                code: 201,
                metadata: {
                    shop: newShop,
                    tokens
                }
            }

            // const tokens = await
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