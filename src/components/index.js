import blessed from 'blessed'

export const screen = blessed.screen({ smartCSR: true })

screen.title = 'FreeBox Cmder'
screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

export const loader = blessed.box({
  width: '100%',
  height: '100%',
  align: 'center',
  valign: 'middle',
  content: 'Checking for Freebox around   /'
})

export const main = blessed.box({
  width: '100%',
  height: '100%',
  label: 'Freebox Cmder',
  top: 'center',
  left: 'center',
  border: {
    type: 'line',
    fg: 'blue'
  }
})
