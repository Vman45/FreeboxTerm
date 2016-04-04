import { createAction } from 'redux-actions'

export const saveToken = (uid, token) => createAction('SAVE_TOKEN')({ uid, token })
export const saveSession = session => createAction('SAVE_SESSION')(session)
