import axios from 'axios'
import querystring from 'querystring'
import { batchActions } from 'redux-batched-actions'
import { writeFile } from 'fs'

import config from 'config'
import store from 'store'
import { ioRates, disk, downloads } from 'actions/data'

const getHeaders = isForm => ({ headers: { 'X-Fbx-App-Auth': store.getState().config.get('session'), } })

export const logToFile = data => writeFile('./freebox.log', data)

export const fileSize = e =>
  e < 1e3 ? `${e} octets`
  : e < 1e6 ? `${Math.round(e * 10 / 1e3) / 10} Ko`
  : e < 1e9 ? `${Math.round(e * 10 / 1e6) / 10} Ko`
  : `${Math.round(e * 10 / 1e9) / 10} Go`

export const rate = e =>
  e === 0 ? '-'
  : e < 1e3 ? `${e} octet/s`
  : e < 1e6 ? `${Math.round(e * 10 / 1e3) / 10} Ko/s`
  : e < 1e9 ? `${Math.round(e * 10 / 1e6) / 10} Mo/s`
  : `${Math.round(e * 10 / 1e9) / 10} Go/s`

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
    t && n >= 2 ? r : (e > 0 && (r += e + 's'), r)))
}

export const toggleTorrent = () => {
  const { ui, data } = store.getState()
  if (ui.get('activeMenu') !== 0) { return }
  const { id, status } = data.get('downloads').toJS()[ui.get('currentTorrent')]
  const switcher = {
    seeding: 'stopped',
    downloading: 'stopped',
    stopped: 'downloading',
    error: 'retry'
  }

  axios.put(`${config.base}/api/v3/downloads/${id}`, { status: switcher[status] }, getHeaders())
}
export const deleteTorrent = () => {
  const { ui, data } = store.getState()
  if (ui.get('activeMenu') !== 0) { return }
  const { id } = data.get('downloads').toJS()[ui.get('currentTorrent')]
  axios.delete(`${config.base}/api/v3/downloads/${id}/erase`, getHeaders())
}

let dlRefresh = false

export const stopAllReloads = () => {
  dlRefresh = false
}

export const startReloadDl = () => {

  const fn = () => {

    Promise.all([
      axios.get(`${config.base}/api/v3/downloads/stats`, getHeaders()),
      axios.get(`${config.base}/api/v3/storage/disk`, getHeaders()),
      axios.get(`${config.base}/api/v3/downloads/`, getHeaders())
    ]).then(([{ data: { result: resultStats } }, { data: { result: resultStorage } }, { data: { result: resultDownloads } }]) => {

      const { rx_rate, tx_rate } = resultStats

      const { used_bytes, free_bytes } = resultStorage[0].partitions[0]
      const total = used_bytes + free_bytes

      const free = ((free_bytes / total) * 100).toFixed(0) / 100
      const used = (100 - free * 100)

      store.dispatch(batchActions([
        ioRates({
          rx_rate: ((rx_rate / 1048576)).toFixed(3),
          tx_rate: ((tx_rate / 1048576)).toFixed(3)
        }),
        disk({ free, used }),
        downloads(resultDownloads.sort((a, b) => a.created_ts - b.created_ts))
      ]))

      if (!dlRefresh) { return }
      setTimeout(fn, 1e3)

    })

  }

  dlRefresh = true
  fn()

}

export const dl = url => axios.post(`${config.base}/api/v3/downloads/add`, `download_url=${querystring.escape(url)}`, getHeaders())
