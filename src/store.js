import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { enableBatching } from 'redux-batched-actions'
import { writeFile } from 'fs'

import config from 'config'
import reducer from 'reducers'
import render from 'render'

const store = createStore(enableBatching(reducer), {}, compose(applyMiddleware(thunk)))

let prev

store.subscribe(() => {
  const cur = store.getState()

  if (!prev || prev.config !== cur.config) {
    writeFile(config.dotfile, JSON.stringify(cur.config.toJS()))
  }

  if (prev && prev.ui !== cur.ui) { render() }
  if (prev && prev.data !== cur.data) { render() }

  prev = cur

})

export default store
