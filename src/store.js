import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { writeFile } from 'fs'

import config from 'config'
import reducer from 'reducers'
import render from 'render'
import { stopAllReloads, startReloadDl } from 'utils'

const store = createStore(reducer, {}, compose(applyMiddleware(thunk)))

let prev

store.subscribe(() => {
  const cur = store.getState()

  if (!prev || prev.config !== cur.config) {
    writeFile(config.dotfile, JSON.stringify(cur.config.toJS()))
  }

  if (prev && prev.ui !== cur.ui) {
    if (cur.ui.get('activeMenu') === 0) {
      startReloadDl()
    } else {
      stopAllReloads()
    }
    render()
  }

  if (prev && prev.data !== cur.data) { render() }

  prev = cur

})

export default store
