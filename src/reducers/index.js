import { combineReducers } from 'redux'

import config from './config'
import ui from './ui'
import data from './data'

export default combineReducers({
  config,
  data,
  ui
})
