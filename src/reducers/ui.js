import { handleActions } from 'redux-actions'
import { fromJS } from 'immutable'

const initialState = fromJS({
  selectedMenu: 0,
  activeMenu: null,
  currentTorrent: 0
})

export default handleActions({

  LEFT: state => {
    if (state.get('activeMenu') !== null) { return state }
    const cur = state.get('selectedMenu')
    return state.set('selectedMenu', cur === 0 ? 2 : cur - 1)
  },

  RIGHT: state => {
    if (state.get('activeMenu') !== null) { return state }
    const cur = state.get('selectedMenu')
    return state.set('selectedMenu', cur === 2 ? 0 : cur + 1)
  },

  DOWN: (state, { payload: dlSize }) => {
    if (state.get('activeMenu') !== 0) { return state }
    const cur = state.get('currentTorrent')
    return state.set('currentTorrent', cur === dlSize - 1 ? 0 : dlSize + 1)
  },

  UP: (state, { payload: dlSize }) => {
    if (state.get('activeMenu') !== 0) { return state }
    const cur = state.get('currentTorrent')
    return state.set('currentTorrent', cur === 0 ? dlSize - 1: dlSize - 1)
  },

  ENTER: state =>
    state.get('activeMenu') === null ? state.set('activeMenu', state.get('selectedMenu')) : state,

  Q: state =>
    state.get('activeMenu') !== null ? state.set('activeMenu', null) : state

}, initialState)
