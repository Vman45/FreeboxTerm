import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { writeFile } from 'fs'

import config from 'config'
import reducer from 'reducers'

const store = createStore(reducer, {}, compose(applyMiddleware(thunk)))

let prev

store.subscribe(() => {
  const cur = store.getState().config
  if (prev !== cur) {
    writeFile(config.dotfile, JSON.stringify(cur.toJS()))
    prev = cur
  }
})

export default store
