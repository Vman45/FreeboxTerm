import { createAction } from 'redux-actions'

export const left = createAction('LEFT')
export const right = createAction('RIGHT')
export const enter = createAction('ENTER')
export const q = createAction('Q')
export const file = createAction('FILE')

const _down = createAction('DOWN')
const _up = createAction('UP')

export const down = () => (dispatch, getState) => {
  const { data } = getState()
  const dls = data.get('downloads').size
  const files = data.get('files').size
  dispatch(_down({ dls, files }))
}

export const up = () => (dispatch, getState) => {
  const { data } = getState()
  const dls = data.get('downloads').size
  const files = data.get('files').size
  dispatch(_up({ dls, files }))
}
