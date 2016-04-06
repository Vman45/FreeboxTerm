import { screen } from 'components'

import store from 'store'
import { left, right, enter, q } from 'actions/ui'

screen.key(['escape', 'C-c'], () => process.exit(0))
screen.key('left', () => store.dispatch(left()))
screen.key('right', () => store.dispatch(right()))
screen.key('enter', () => store.dispatch(enter()))
screen.key('q', () => store.dispatch(q()))
