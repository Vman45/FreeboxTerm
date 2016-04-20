import blessed from 'blessed'
import dateFormat from 'dateformat'

import * as components from 'components'
import { duration, fileSize, rate } from 'utils'
import store from 'store'

const icons = {
  stopped: { txt: '▮▮', color: 'yellow' },
  queued: { txt: 'ℚ', color: 'yellow' },
  starting: { txt: '⇣', color: 'green' },
  downloading: { txt: '⇣', color: 'green' },
  stopping: { txt: '⇥', color: 'yellow' },
  error: { txt: '✖', color: 'red' },
  done: { txt: '✓', color: 'green' },
  checking: { txt: 'ℂ', color: 'yellow' },
  repairing: { txt: 'ℝ', color: 'yellow' },
  extracting: { txt: '⇣', color: 'green' },
  seeding: { txt: '⇡', color: 'green' },
  retry: { txt: '↺', color: 'yellow' }
}

const dlModeColors = {
  normal: 'green',
  slow: 'yellow',
  hibernate: 'red'
}

export default () => {

  const ui = store.getState().ui.toJS()
  const data = store.getState().data.toJS()
  const { screen } = components

  components.diskGauge.setStack(data.disk)
  components.dlChart.setData(data.ioRates)
  components.dlGauge.hide()
  components.files.hide()

  components.dlList.children.forEach(c => c.hide() && c.free() && c.destroy())
  components.dlList.children = []

  if (data.download) {
    components.dlGauge.show()
    components.dlGauge.setPercent((data.download.percentage * 100).toFixed(2))
  }

  if (data.wifi !== null) {
    components.wifi.style.fg = data.wifi ? 'green' : 'red'
  }

  if (data.dlMode !== null) {
    components.dlMode.style.fg = dlModeColors[data.dlMode]
  }

  data.downloads.forEach((dl, i) => {
    if ((i < ui.currentTorrent && data.downloads.length - i > 10) || (i > ui.currentTorrent + 10)) { return }

    const box = blessed.layout({ width: '100%', height: '10%', valign: 'middle' })
    const icon = icons[dl.status]
    const status = blessed.box({ ...components.txtBase, width: '5%', content: icon.txt, fg: icon.color })
    const name = blessed.box({ ...components.txtBase, width: '35%', content: dl.name.substring(0, 60), align: 'left', fg: ui.currentTorrent === i ? 'white' : 'grey' })
    const progress = blessed.box({ ...components.txtBase, width: '7%', content: `${dl.rx_pct / 100}%` })
    const eta = blessed.box({ ...components.txtBase, width: '8%', content: duration(dl.eta) })
    const speed = blessed.box({
      ...components.txtBase,
      width: '10%',
      tags: true,
      content: dl.status === 'downloading' ? rate(dl.rx_rate) : rate(dl.tx_rate)
    })

    const stats = blessed.box({
      ...components.txtBase,
      width: '20%',
      content: `{blue-fg}${fileSize(dl.rx_bytes)} ⇣{/blue-fg} / {red-fg}${fileSize(dl.tx_bytes)} ⇡{/red-fg} (${Math.round(dl.rx_bytes ? 100 * dl.tx_bytes / dl.rx_bytes : 0) / 100})`,
      tags: true,
      align: 'left'
    })

    const date = blessed.box({
      ...components.txtBase,
      width: '15%',
      content: dateFormat(new Date(dl.created_ts * 1000), 'd mmmm yyyy HH:MM:ss'),
      align: 'right'
    })

    box.append(status)
    box.append(name)
    box.append(progress)
    box.append(eta)
    box.append(speed)
    box.append(stats)
    box.append(date)

    components.dlList.append(box)

  })

  if (ui.fileSelected !== null) {
    components.files.setContent(data.files.map((r, i) => i === ui.fileSelected ? `{white-fg}${r.name}{/white-fg}` : r.name).join('\n'))
    components.files.show()
  }

  screen.render()
}
