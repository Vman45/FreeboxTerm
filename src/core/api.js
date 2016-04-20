import axios from 'axios'
import path from 'path'
import request from 'request'
import progress from 'request-progress'
import querystring from 'querystring'
import { batchActions } from 'redux-batched-actions'
import { createWriteStream } from 'fs'

import config from 'config'
import store from 'store'
import { logToFile, getHeaders } from 'utils'
import { setMessage } from 'components/message'
import { file } from 'actions/ui'
import {
  wifi,
  ioRates,
  disk,
  dlMode,
  downloads,
  endDownload,
  downloading,
  files
} from 'actions/data'

export const download = (filepath, name) => {
  progress(request({ url: `${config.base}/api/v3/dl/${filepath}`, ...getHeaders() }), { throttle: 200 })
    .on('progress', status => store.dispatch(downloading(status)))
    .on('error', () => store.dispatch(endDownload()))
    .on('end', () => store.dispatch(endDownload()))
    .pipe(createWriteStream(path.join(process.env.HOME, 'downloads', name)))
}

export const downloadFile = () => {
  const { ui, data } = store.getState()
  const cur = ui.get('fileSelected')
  if (cur === null) { return }

  const f = data.get('files').toJS()[cur]
  store.dispatch(file(null))
  download(f.filepath, f.name)
}

export const downloadTorrent = () => {
  const { ui, data } = store.getState()
  if (ui.get('fileSelected') !== null) { return }

  const { id } = data.get('downloads').toJS()[ui.get('currentTorrent')]

  axios.get(`${config.base}/api/v3/downloads/${id}/files`, getHeaders())
    .then(({ data }) => {
      const { result, success } = data
      if (success !== true) { return }

      if (result.length > 1) {
        return store.dispatch(batchActions([
          files(result),
          file(0)
        ]))
      }

      download(result[0].filepath, result[0].name)
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
