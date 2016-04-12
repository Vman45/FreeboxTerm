import blessed from 'blessed'

import * as components from 'components'
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
      components.dlList.children.forEach(c => c.destroy())
      screen.append(components.dlPage)

      components.diskGauge.setStack(data.disk)
      components.dlChart.setData(data.ioRates)

      const box = blessed.layout({ width: '100%', height: '10%', valign: 'middle' })
      const box2 = blessed.layout({ width: '100%', height: '10%', valign: 'middle', bg: 'red' })
      if (data.downloads.length) {
        const leoeuoeu = '✕, ⇣'
        const icons = {
          stopped: '▮▮',
          queued: '▮▮',
          starting: '...',
          downloading: '⇣',
          stopping	task is gracefully stopping
          error	there was a problem with the download, you can get an error code in the error field
          done	the download is over. For bt you can resume seeding setting the status to seeding if the ratio is not reached yet
          checking	(only valid for nzb) download is over, the downloaded files are being checked using par2
          repairing	(only valid for nzb) download is over, the downloaded files are being repaired using par2
          extracting	only valid for nzb) download is over, the downloaded files are being extracted
          seeding	(only valid for bt) download is over, the content is Change to being shared to other users. The task will automatically stop once the seed ratio has been reached
          retry
        }
        const status = blessed.box({ ...components.txtBase, width: '5%', content: '⇡', fg: 'green' })
        const name = blessed.box({ ...components.txtBase, width: '45%', content: data.downloads[0].name })
        const progress = blessed.box({ ...components.txtBase, width: '10%', content: `70%` })
        box.append(status)
        box.append(name)
        box.append(progress)
      }

      components.dlList.append(box)
      components.dlList.append(box2)

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
