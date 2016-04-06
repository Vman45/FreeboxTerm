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
      screen.append(components.dlPage)
      components.diskGauge.setStack(data.disk)
      components.dlChart.setData(data.ioRates)
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
