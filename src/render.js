import blessed from 'blessed'
import dateFormat from 'dateformat'

import * as components from 'components'
import { fileSize } from 'utils'
import store from 'store'

export default () => {

  const ui = store.getState().ui.toJS()
  const data = store.getState().data.toJS()
  const { screen } = components

  screen.remove(components.dlPage)
  screen.remove(components.menuPage)

  const switcher = {
    null: () => screen.append(components.menuPage),
    0: () => {
      screen.append(components.dlPage)

      components.diskGauge.setStack(data.disk)
      components.dlChart.setData(data.ioRates)

      const icons = {
        stopped: { txt: '▮▮', color: 'orange' },
        queued: { txt: 'ℚ', color: 'orange' },
        starting: { txt: '⇣', color: 'green' },
        downloading: { txt: '⇣', color: 'green' },
        stopping: { txt: '✖', color: 'orange' },
        error: { txt: '✖', color: 'red' },
        done: { txt: '✓', color: 'green' },
        checking: { txt: 'ℂ', color: 'yellow' },
        repairing: { txt: 'ℝ', color: 'yellow' },
        extracting: { txt: '⇣', color: 'green' },
        seeding: { txt: '⇡', color: 'green' },
        retry: { txt: '↺', color: 'yellow' }
      }

      components.dlList.children.forEach(c => c.hide() && c.destroy())

      let i = 0
      data.downloads.forEach(dl => {
        if (i === 10) { return }

        const box = blessed.layout({ width: '100%', height: '10%', valign: 'middle' })
        if (data.downloads.length) {
          const icon = icons[dl.status]
          const status = blessed.box({ ...components.txtBase, width: '5%', content: icon.txt, fg: icon.color })
          const name = blessed.box({ ...components.txtBase, width: '35%', content: dl.name, align: 'left' })
          const progress = blessed.box({ ...components.txtBase, width: '10%', content: `${dl.rx_pct / 100}%` })
          const eta = blessed.box({ ...components.txtBase, width: '5%', content: `${dl.eta}s` })
          const speed = blessed.box({
            ...components.txtBase,
            width: '10%',
            content: dl.status === 'downloading' ? dl.rx_rate / 100 : dl.tx_rate / 100
          })

          const stats = blessed.box({
            ...components.txtBase,
            width: '20%',
            content: `${fileSize(dl.rx_bytes)} / ${fileSize(dl.tx_bytes)} (${Math.round(dl.rx_bytes ? 100 * dl.tx_bytes / dl.rx_bytes : 0) / 100})`,
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
        }

        components.dlList.append(box)

        ++i
      })

    },
    1: () => {},
    2: () => {}
  }

  switcher[ui.activeMenu]()

  components.menus.forEach((menu, i) => {
    menu.style = {
      ...menu.style,
      border: { fg: i === ui.selectedMenu ? 'cyan' : 'blue' },
      fg: i === ui.selectedMenu ? 'white' : 'gray'
    }
  })

  screen.render()
}
