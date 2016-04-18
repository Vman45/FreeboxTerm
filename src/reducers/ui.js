import { handleActions } from 'redux-actions'
import { fromJS } from 'immutable'

const initialState = fromJS({
  selectedMenu: 0,
  currentTorrent: 0
})

export default handleActions({

  DOWN: (state, { payload: dlSize }) => {
    const cur = state.get('currentTorrent')
    return state.set('currentTorrent', cur === dlSize - 1 ? 0 : cur + 1)
  },

  UP: (state, { payload: dlSize }) => {
    const cur = state.get('currentTorrent')
    return state.set('currentTorrent', cur === 0 ? dlSize - 1 : cur - 1)
  },

  Q: state => state

}, initialState)
