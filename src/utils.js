import axios from 'axios'
import path from 'path'
import querystring from 'querystring'
import request from 'request'
import progress from 'request-progress'
import { batchActions } from 'redux-batched-actions'
import { writeFile, createWriteStream } from 'fs'

import config from 'config'
import store from 'store'
import {
  wifi,
  ioRates,
  disk,
  dlMode,
  downloads,
  endDownload,
  downloading
} from 'actions/data'
import { setMessage } from 'components/message'

const getHeaders = () => ({ headers: { 'X-Fbx-App-Auth': store.getState().config.get('session') } })

export const logToFile = data => writeFile('./freebox.log', data)

export const fileSize = e =>
  e < 1e3 ? `${e} octets`
  : e < 1e6 ? `${Math.round(e * 10 / 1e3) / 10} Ko`
  : e < 1e9 ? `${Math.round(e * 10 / 1e6) / 10} Mo`
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

export const toggleMode = shifted => {
  const { data } = store.getState()
  const dlMode = data.get('dlMode')
  const switcher = { normal: 'slow', slow: 'normal', hibernate: 'normal' }
  const switcherShift = { normal: 'hibernate', slow: 'hibernate', hibernate: 'normal' }

  axios.put(`${config.base}/api/v3/downloads/throttling`, {
    throttling: shifted ? switcherShift[dlMode] : switcher[dlMode]
  }, getHeaders())
  .catch(({ data }) => {
    if (data.msg) { setMessage(data.msg, 'error') }
  })
}

export const toggleWifi = () => {
  const { data } = store.getState()
  axios.put(`${config.base}/api/v3/wifi/config`, { enabled: !data.get('wifi') }, getHeaders())
    .catch(({ data }) => {
      if (data.msg) { setMessage(data.msg, 'error') }
    })
}

export const deleteTorrent = () => {
  const { ui, data } = store.getState()
  if (ui.get('activeMenu') !== 0) { return }
  const { id } = data.get('downloads').toJS()[ui.get('currentTorrent')]
  axios.delete(`${config.base}/api/v3/downloads/${id}/erase`, getHeaders())
    .catch(({ data }) => {
      if (data.msg) { setMessage(data.msg, 'error') }
    })
}

export const downloadTorrent = () => {
  const { ui, data } = store.getState()
  if (ui.get('activeMenu') !== 0) { return }
  const { id } = data.get('downloads').toJS()[ui.get('currentTorrent')]
  axios.get(`${config.base}/api/v3/downloads/${id}/files`, getHeaders())
    .then(({ data }) => {
      const { result, success } = data
      if (success !== true) { return }

      // TODO
      if (result.length > 1) { return }

      progress(request({ url: `${config.base}/api/v3/dl/${result[0].filepath}`, ...getHeaders() }), { throttle: 200 })
        .on('progress', progress => store.dispatch(downloading(progress)))
        .on('error', () => store.dispatch(endDownload()))
        .on('end', () => store.dispatch(endDownload()))
        .pipe(createWriteStream(path.join(process.env.HOME, 'downloads', result[0].name)))
    })
    .catch(({ data }) => {
      if (data.msg) { setMessage(data.msg, 'error') }
    })
}

let refresh = false

export const stopAllReloads = () => {
  refresh = false
}

export const startReload = () => {

  const fn = () => {

    Promise.all([
      axios.get(`${config.base}/api/v3/downloads/stats`, getHeaders()),
      axios.get(`${config.base}/api/v3/storage/disk`, getHeaders()),
      axios.get(`${config.base}/api/v3/downloads/`, getHeaders()),
      axios.get(`${config.base}/api/v3/wifi/config`, getHeaders())
    ]).then(([
      { data: { result: resultStats } },
      { data: { result: resultStorage } },
      { data: { result: resultDownloads } },
      { data: { result: resultWifi } }
    ]) => {

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
        downloads(resultDownloads.sort((a, b) => a.created_ts - b.created_ts)),
        wifi(resultWifi.enabled),
        dlMode(resultStats.throttling_mode)
      ]))

      if (!refresh) { return }
      setTimeout(fn, 1e3)

    })

  }

  refresh = true
  fn()

}

export const dl = url => axios.post(`${config.base}/api/v3/downloads/add`, `download_url=${querystring.escape(url)}`, getHeaders())
