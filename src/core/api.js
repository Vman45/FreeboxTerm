import axios from 'axios'
import progress from 'request-progress'
import path from 'path'
import querystring from 'querystring'
import request from 'request'
import { batchActions } from 'redux-batched-actions'
import { createWriteStream } from 'fs'

import config from 'config'
import { getHeaders } from 'utils'
import { setMessage } from 'components/message'
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

export const downloadTorrent = () => {
  const { ui, data } = store.getState()
  // TODO redo
  // if (ui.get('activeMenu') !== 0) { return }
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

export const dl = url => axios.post(`${config.base}/api/v3/downloads/add`, `download_url=${querystring.escape(url)}`, getHeaders())

export const pool = () => {
  return Promise.all([
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

    return null
  })
}
