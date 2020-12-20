process.env.NODE_ENV = process.env.NODE_ENV || 'staging'

const environment = require('./environment')

const config = environment.toWebpackConfig()
config.devtool = 'none'

module.exports = environment.toWebpackConfig()
