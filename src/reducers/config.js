import { handleActions } from 'redux-actions'
import { writeFile, readFileSync } from 'fs'

import config from 'config'

let initialState = {
  session: null,
  tokens: {}
}

try {
  initialState = JSON.parse(readFileSync(config.dotfile, 'utf-8'))
} catch (e) {}

export default handleActions({

  SAVE_SESSION: (state, { payload: session }) => {
    const newState = { ...state, session }
    writeFile(config.dotfile, JSON.stringify(newState))
    return newState
  },

  SAVE_TOKEN: (state, { payload: { uid, token } }) => {

    const newState = {
      ...state,
      tokens: {
        ...state.tokens,
        [uid]: token
      }
    }

    writeFile(config.dotfile, JSON.stringify(newState))
    return newState
  }

}, initialState)
