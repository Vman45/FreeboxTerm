import blessed from 'blessed'
import axios from 'axios'

import { authorize } from 'authentication'
import { screen, loader, main, title } from 'components'
import { start, stop } from 'loader'
import config from 'config'
import store from 'store'

start()

axios.get(`${config.base}/api_version`)
  .catch(() => { throw new Error('No Freebox found.') })
  .then(({ data: { uid } }) => authorize(uid))
  .then(() => {
    stop()
    screen.append(main)
    main.append(title)
    screen.render()
  })
  .catch((err) => {
    console.log(err.stack)
    stop(true)
    loader.content = err.message
    screen.render()
  })
