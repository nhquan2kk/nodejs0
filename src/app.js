const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();


//init middleware
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
//init db
require('./dbs/init.mongodb')
const { checkOverLoad } = require('./helpers/check.Connect')
checkOverLoad()
//init routes
app.get('/', (req, res, next) => {
    // const strComp = 'Hello Compression'
    return res.status(200).json({
        message: 'Welcome nodejs',
        // metadata: strComp.repeat(10000)
    })
})
//handling errors



module.exports = app