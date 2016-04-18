import { writeFile } from 'fs'

import store from 'store'
import { pool } from 'core/api'

/**
 * Construct header object from session token
 */
export const getHeaders = () => ({ headers: { 'X-Fbx-App-Auth': store.getState().config.get('session') } })

/**
 * Log util in file
 */
export const logToFile = data => writeFile('./freebox.log', data)

/**
 * Humanize octets
 */
export const fileSize = e =>
  e < 1e3 ? `${e} octets`
  : e < 1e6 ? `${Math.round(e * 10 / 1e3) / 10} Ko`
  : e < 1e9 ? `${Math.round(e * 10 / 1e6) / 10} Mo`
  : `${Math.round(e * 10 / 1e9) / 10} Go`

/**
 * Humanize rate
 */
export const rate = e =>
  e === 0 ? '-'
  : e < 1e3 ? `${e} octet/s`
  : e < 1e6 ? `${Math.round(e * 10 / 1e3) / 10} Ko/s`
  : e < 1e9 ? `${Math.round(e * 10 / 1e6) / 10} Mo/s`
  : `${Math.round(e * 10 / 1e9) / 10} Go/s`

/**
 * Format duration to human readable string
 */
export const duration = (e, t) => {
  let n, r, i, s, o

  return e < 0 ? ' - ' : (n = 0,
    r = '',
    e > 86400 && (i = Math.floor(e / 86400),
    r += `${i}j`,
    e %= 86400,
    ++n),
    e > 3600 && (s = Math.floor(e / 3600),
    r += `${s}h`,
    e %= 3600,
    ++n),
    t && n >= 2 ? r : (e > 60 && (o = Math.floor(e / 60),
    r += `${o}m`,
    e %= 60),
    t && n >= 2 ? r : (e > 0 && (r += `${e}s`), r)))
}

let refresh = false

/**
 * Finish reloads in progress
 */
export const stopAllReloads = () => {
  refresh = false
}

/**
 * Start poolings
 */
export const startReload = () => {
  const fn = () => {
    pool().then(() => {
      if (!refresh) { return }
      setTimeout(fn, 1e3)
    })
  }

  refresh = true
  fn()
}
