import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { getCurrentThemeName, injectCssVars } from '../../dist'
import './index.css'

import {
  themes,
  themeLocalStorageKey,
  defaultThemeName,
  theme,
  changeTheme,
} from './theme'

const App = () => {
  const onClick = () => {
    const isLightTheme = getCurrentThemeName(defaultThemeName) === 'lightTheme'
    changeTheme(isLightTheme ? 'darkTheme' : 'lightTheme')
  }

  return (
    <div
      style={{
        display: 'grid',
        height: '100vh',
        width: '100vw',
        placeContent: 'center',
        placeItems: 'center',
        background: theme.colors.bg,
        color: theme.colors.text,
      }}
    >
      <h1>React Example</h1>

      <div style={{ display: 'grid', gridAutoFlow: 'column', gap: '1rem' }}>
        <button
          style={{
            background: theme.colors.buttonBg,
            color: theme.colors.buttonColor,
          }}
          onClick={onClick}
        >
          Toggle Theme
        </button>
      </div>
    </div>
  )
}

injectCssVars({
  themes,
  defaultThemeName,
  localStorageKey: themeLocalStorageKey,
})

ReactDOM.render(<App />, document.getElementById('root'))
