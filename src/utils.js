import axios from 'axios'

import config from 'config'
import store from 'store'
import { ioRates, disk } from 'actions/data'

const getHeaders = () => ({ headers: { 'X-Fbx-App-Auth': store.getState().config.get('session') } })

let intDl

export const stopAllReloads = () => {
  clearInterval(intDl)
  intDl = null
}

export const startReloadDl = () => {
  stopAllReloads()

  intDl = setInterval(() => {

    Promise.all([
      axios.get(`${config.base}/api/v3/downloads/stats`, getHeaders()),
      axios.get(`${config.base}/api/v3/storage/disk`, getHeaders())
    ]).then(([{ data: { result: resultStats } }, { data: { result: resultStorage } }]) => {

      const { rx_rate, tx_rate } = resultStats
      store.dispatch(ioRates({
        rx_rate: (rx_rate / 1048576).toFixed(3),
        tx_rate: (tx_rate / 1048576).toFixed(3)
      }))

      const { used_bytes, free_bytes } = resultStorage[0].partitions[0]
      const total = used_bytes + free_bytes

      const free = ((free_bytes / total) * 100).toFixed(2)
      const used = (100 - free).toFixed(2)

      store.dispatch(disk({ free, used }))

    })

  }, 1e3)
}
