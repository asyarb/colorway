import {
  createChangeThemeFn,
  AdditionalTheme,
  convertThemeToCssVars,
} from '../../dist'

type Theme = typeof lightTheme
const lightTheme = {
  colors: {
    text: 'black',
    bg: 'white',
    buttonBg: 'black',
    buttonColor: 'white',
  },
}

// Typing as `AdditionalTheme` provides autocomplete from your base theme.
const darkTheme: AdditionalTheme<Theme> = {
  colors: {
    text: 'white',
    bg: 'black',
    buttonBg: 'white',
    buttonColor: 'black',
  },
}

export const themes = {
  lightTheme,
  darkTheme,
}
export const defaultThemeName: keyof typeof themes = 'lightTheme'
export const themeLocalStorageKey = 'myTheme'
export const changeTheme = createChangeThemeFn({
  themes,
  localStorageKey: themeLocalStorageKey,
})
export const theme = convertThemeToCssVars(lightTheme)
