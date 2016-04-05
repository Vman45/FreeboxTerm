import { hostname } from 'os'
import axios from 'axios'
import { createHmac } from 'crypto'

import { start } from 'components/loader'
import store from 'store'
import config from 'config'
import { saveToken, saveSession } from 'actions/config'

/**
 * Either login or register
 */
export const authorize = uid => {
  const app_token = store.getState().config.getIn(['tokens', uid])
  if (!app_token) { return register(uid) }
  return login(app_token, uid)
}

/**
 * Create a new session using the given challenge and app token
 * If fails to authenticate, register again
 */
const openSession = (app_token, challenge, uid) => {

  const password = createHmac('sha1', app_token).update(challenge).digest('hex')
  const { app_id } = config

  return axios.post(`${config.base}/api/v3/login/session`, { app_id, password })
    .then(({ data }) => {
      if (!data.success) { throw new Error('Cannot retrieve session token.') }

      // TODO maybe require to have result.permissions.settings to true
      const { result: { session_token } } = data
      store.dispatch(saveSession(session_token))

    })
    .catch(({ data }) => {
      const { error_code } = data
      if (error_code === 'invalid_token') { return register(uid) }
      throw new Error('Cannot create session.')
    })
}

/**
 * Retrieve the challenge and call openSession
 */
const login = (app_token, uid) => {

  start('Login in')

  return axios.get(`${config.base}/api/v3/login`)
    .then(({ data }) => {
      if (!data.success) { throw new Error('Cannot retrieve challenge code.') }
      return openSession(app_token, data.result.challenge, uid)
    })
}

/**
 * Register our app if it's not already present in the tokens save
 * and call openSession
 */
const register = uid => {

  const { app_id, app_name, app_version } = config

  start('Waiting for authorization')

  return axios.post(`${config.base}/api/v3/login/authorize`, {
    app_id,
    app_name,
    app_version,
    device_name: hostname()
  })
  .then(({ data }) => {
    if (!data.success) { throw new Error('Cannot authorize application.') }
    const { result: { app_token, track_id } } = data
    return [app_token, track_id]
  })
  .then(([app_token, track_id]) => new Promise((resolve, reject) => {

    const int = setInterval(() => {

      axios.get(`${config.base}/api/v3/login/authorize/${track_id}`)
        .then(({ data }) => {
          if (!data.success) { throw new Error('Authorization pooling failed.') }

          const { result: { status, challenge } } = data
          if (status !== 'pending') { clearInterval(int) }

          const fns = {
            timeout: () => { throw new Error('Authorization expired.') },
            denied: () => { throw new Error('Authorization denied.') },
            unknown: () => { throw new Error('Invalid app_token.') },
            granted: () => resolve([app_token, challenge]),
            pending: f => f
          }

          fns[status]()

        })
        .catch(err => reject(err))

    }, 1e3)

  }))
  .then(([app_token, challenge]) => {
    store.dispatch(saveToken(uid, app_token))
    return openSession(app_token, challenge, uid)
  })

}
