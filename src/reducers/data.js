import { handleActions } from 'redux-actions'
import { fromJS } from 'immutable'

const initialState = fromJS({
  ioRates: [{ x: [], y: [], style: { line: 'blue' }, title: 'dl (mb/s)' }, { x: [], y: [], style: { line: 'red' }, title: 'up (mb/s)' }],
  disk: [{ percent: 0, stroke: 'red' }, { percent: 0, stroke: 'green' }],
  downloads: []
})

export default handleActions({

  IO_RATES: (state, { payload: rates }) => {
    const s = new Date().getDate()

    return state
      .updateIn(['ioRates', 0, 'y'], l => l.size === 10 ? l.push(rates.rx_rate).delete(0) : l.push(rates.rx_rate))
      .updateIn(['ioRates', 1, 'y'], l => l.size === 10 ? l.push(rates.tx_rate).delete(0) : l.push(rates.tx_rate))
      .updateIn(['ioRates', 0, 'x'], l => l.size === 10 ? l.push(s).delete(0) : l.push(s))
      .updateIn(['ioRates', 1, 'x'], l => l.size === 10 ? l.push(s).delete(0) : l.push(s))
  },

  DISK: (state, { payload: { free, used } }) =>
    state
      .updateIn(['disk', 0], e => e.set('percent', used))
      .updateIn(['disk', 1], e => e.set('percent', free)),

  DOWNLOADS: (state, { payload: downloads }) =>
    state.set('downloads', fromJS(downloads))

}, initialState)
