import { handleActions } from 'redux-actions'
import { fromJS } from 'immutable'
import { readFileSync } from 'fs'

import config from 'config'

let initialState = fromJS({
  session: null,
  tokens: {}
})

try {
  initialState = fromJS(JSON.parse(readFileSync(config.dotfile, 'utf-8')))
} catch (e) {
  console.log(e)
}

export default handleActions({

  SAVE_SESSION: (state, { payload: session }) => state.set('session', session),

  SAVE_TOKEN: (state, { payload: { uid, app_token } }) =>
    state.updateIn(['tokens'], tokens => tokens.set(uid, app_token))

}, initialState)
