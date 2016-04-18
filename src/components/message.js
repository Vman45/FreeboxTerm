import { msg } from 'components'

let id

export const setMessage = (txt, type) => {
  if (id) { clearTimeout(id) }

  id = setTimeout(() => {
    msg.setContent('')
    id = null
  }, 5e3)

  if (!type) { msg.style.fg = 'white' }
  if (type === 'error') { msg.style.fg = 'red' }

  msg.setContent(`   ${txt}`)
}
