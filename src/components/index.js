import blessed from 'blessed'
import contrib from 'blessed-contrib'

export const screen = blessed.screen({ smartCSR: true })

screen.title = 'FreeboxTerm'

export const loader = blessed.box({
  width: '100%',
  height: '100%',
  align: 'center',
  valign: 'middle',
  content: 'Checking for Freebox around   /'
})

/**
 * Dowload section
 */
export const dlPage = blessed.layout({
  width: '100%',
  height: '100%',
  top: 'center',
  left: 'center'
})

export const dlList = blessed.layout({ height: '60%', width: '100%' })
export const diskGauge = contrib.gauge({ height: '10%', width: '100%' })

const dlBottom = blessed.layout({ height: '30%', width: '100%' })
const borderBottom = blessed.box({ height: 1, width: '100%' })

export const dlChart = contrib.line({
  width: '50%',
  height: '93%',
  showLegend: true,
  legend: { width: 12 }
})

const dlBotRight = blessed.layout({ width: '50%', height: '90%' })

export const dlInfo = blessed.box({
  width: '100%',
  height: '30%',
  content: '',
  fg: 'white'
})

export const dlGauge = contrib.gauge({ width: '100%', height: '60%' })

export const txtBase = { fg: 'white', height: '100%', align: 'center', valign: 'middle' }

const bottomStatus = blessed.layout({ height: 1, width: '100%' })

export const wifi = blessed.text({ content: ' WIFI ', fg: 'white' })
export const dlMode = blessed.text({ content: ' MODE ', fg: 'white' })
export const msg = blessed.text({ fg: 'white' })

bottomStatus.append(wifi)
bottomStatus.append(dlMode)
bottomStatus.append(msg)

screen.append(dlPage)
dlPage.append(dlList)
dlPage.append(diskGauge)
dlPage.append(borderBottom)
dlPage.append(dlBottom)
dlBottom.append(dlChart)
dlBottom.append(dlBotRight)
dlBottom.append(bottomStatus)
dlBotRight.append(dlInfo)
dlBotRight.append(dlGauge)
