import axios from 'axios'
import querystring from 'querystring'
import { batchActions } from 'redux-batched-actions'
import { writeFile } from 'fs'

import config from 'config'
import store from 'store'
import { ioRates, disk, downloads } from 'actions/data'

const getHeaders = isForm => ({ headers: { 'X-Fbx-App-Auth': store.getState().config.get('session'), } })

export const logToFile = data => writeFile('./freebox.log', data)

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

      const free = ((free_bytes / total) * 100).toFixed(2)
      const used = (100 - free).toFixed(2)

      store.dispatch(batchActions([
        ioRates({
          rx_rate: ((rx_rate / 1048576)).toFixed(3),
          tx_rate: ((tx_rate / 1048576)).toFixed(3)
        }),
        disk({ free, used }),
        downloads(resultDownloads)
      ]))

      if (!dlRefresh) { return }
      setTimeout(fn, 1e3)

    })

  }

  dlRefresh = true
  fn()

}

export const dl = url => axios.post(`${config.base}/api/v3/downloads/add`, `download_url=${querystring.escape(url)}`, getHeaders())
