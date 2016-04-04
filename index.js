require('babel-register')
require('babel-polyfill')

const path = require('path')
const appModulePath = require('app-module-path')

appModulePath.addPath(path.join(__dirname, 'src'))

require('./src')
