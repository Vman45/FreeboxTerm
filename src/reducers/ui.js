import { handleActions } from 'redux-actions'
import { fromJS } from 'immutable'

const initialState = fromJS({
  selectedMenu: 0,
  currentTorrent: 0,
  fileSelected: null
})

export default handleActions({

  DOWN: (state, { payload: { dls, files } }) => {
    const curT = state.get('currentTorrent')
    const curF = state.get('fileSelected')
    if (curF !== null) {
      return state.set('fileSelected', curF === files - 1 ? 0 : curF + 1)
    }
    return state.set('currentTorrent', curT === dls - 1 ? 0 : curT + 1)
  },

  UP: (state, { payload: { dls, files } }) => {
    const curT = state.get('currentTorrent')
    const curF = state.get('fileSelected')
    if (curF !== null) {
      return state.set('fileSelected', curF === 0 ? files - 1 : curF - 1)
    }
    return state.set('currentTorrent', curT === 0 ? dls - 1 : curT - 1)
  },

  Q: state => state.set('fileSelected', null),

  FILE: (state, { payload: index }) => state.set('fileSelected', index)

}, initialState)
