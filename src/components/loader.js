import { screen, loader } from 'components'

const pos = {
  '|': '/',
  '/': '-',
  '-': '\\',
  '\\': '|'
}

let interval = null

const setText = text => {
  loader.content = `${text}   /`
}

export const start = text => {
  if (text) { setText(text) }
  if (interval) { return }

  screen.append(loader)

  interval = setInterval(() => {
    const cur = loader.content.slice(-1)
    loader.content = `${loader.content.slice(0, -1)}${pos[cur]}`
    screen.render()
  }, 50)
}

export const stop = keepOnScreen => {
  clearInterval(interval)
  interval = null
  if (!keepOnScreen) { screen.remove(loader) }
}
