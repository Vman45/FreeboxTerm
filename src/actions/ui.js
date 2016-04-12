import { createAction } from 'redux-actions'

export const left = createAction('LEFT')
export const right = createAction('RIGHT')
export const enter = createAction('ENTER')
export const q = createAction('Q')

const _down = createAction('DOWN')
const _up = createAction('UP')

export const down = () => (dispatch, getState) => {
  const { data } = getState()
  dispatch(_down(data.get('downloads').size))
}

export const up = () => (dispatch, getState) => {
  const { data } = getState()
  dispatch(_up(data.get('downloads').size))
}
