import axios from 'axios'

import { authorize } from 'core/auth'
import { loader, screen } from 'components'
import { start, stop } from 'components/loader'
import { dl, startReload } from 'utils'
import config from 'config'
import render from 'render'

const download_url = process.argv[2]

if (download_url) { screen.destroy() }
else { require('core/keys') }

start()

console.log('> Authenticating...')

axios.get(`${config.base}/api_version`)
  .catch(() => { throw new Error('No Freebox found.') })
  .then(({ data: { uid } }) => authorize(uid))
  .then(() => {
    stop()

    if (!download_url) {
      startReload()
      return render()
    }

    console.log('> Authenticated!')
    console.log('> Adding download link...')

    dl(download_url)
      .then(({ data }) => {
        if (data.msg) { console.log(data.msg) }
        else { console.log(`> Link added.`) }
        process.exit(0)
      })
      .catch(err => { throw err })

  })
  .catch((err) => {
    console.log(err.stack)
    stop(true)
    loader.content = err.message
    screen.render()
  })
