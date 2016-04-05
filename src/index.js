import axios from 'axios'
import blessed from 'blessed'
import contrib from 'blessed-contrib'

import { authorize } from 'auth'
import { screen, loader, main, title } from 'components'
import { start, stop } from 'components/loader'
import { getHeaders } from 'utils'
import config from 'config'
import store from 'store'

start()

axios.get(`${config.base}/api_version`)
  .catch(() => { throw new Error('No Freebox found.') })
  .then(({ data: { uid } }) => authorize(uid))
  .then(() => {

    /*
    axios.get(`${config.base}/api/v3/wifi/config`, getHeaders())
      .then(({ data }) => {
        store.dispatch(test())
        console.log(data)
      })
      .catch(err => console.log(err))
     */

    stop()
    screen.append(main)

    const grid = new contrib.grid({ rows: 12, cols: 12, screen })
    grid.set(0, 0, 4, 4, contrib.map, { label: 'h4cking in progress' })
    grid.set(4, 4, 4, 4, contrib.map)

    const line = grid.set(10, 0, 2, 4, contrib.line, {
      style: { line: 'yellow', text: 'green', baseline: 'black' },
 //     xLabelPadding: 3,
 //     xPadding: 5,
      label: 'Title'
    })

    line.setData([{ x: ['t1', 't2', 't3', 't4'], y: [5, 1, 7, 5] }])

    screen.render()
  })
  .catch((err) => {
    console.log(err.stack)
    stop(true)
    loader.content = err.message
    screen.render()
  })
