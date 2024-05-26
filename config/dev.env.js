//开发环境
'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL_HTTPS:'"/api/"',
  BASE_URL_HTTPS_TWO:'"/apiTwo/"'
})
