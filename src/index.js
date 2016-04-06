import axios from 'axios'

import { authorize } from 'auth'
import { loader } from 'components'
import { start, stop } from 'components/loader'
import config from 'config'
import render from 'render'

import 'keys'

start()

axios.get(`${config.base}/api_version`)
  .catch(() => { throw new Error('No Freebox found.') })
  .then(({ data: { uid } }) => authorize(uid))
  .then(() => {
    stop()
    render()
  })
  .catch((err) => {
    console.log(err.stack)
    stop(true)
    loader.content = err.message
    screen.render()
  })
