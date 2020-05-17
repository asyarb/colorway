import { InjectableThemes, ColorwayArgs } from './types'

/**
 * Creates the fallback CSS variable declaration style string that
 * can be injected into a `<style>` tag. Allows for colors and styles for
 * non-JS users and SSR.
 *
 * @param props
 * @returns A valid CSS rule string initializing the CSS variables.
 */
export const createFallbackStyleString = <T extends InjectableThemes>({
  themes,
  defaultThemeName,
}: Omit<ColorwayArgs<T>, 'localStorageKey'>) => {
  let styleString = 'html{'
  const defaultTheme = themes[defaultThemeName as string]

  for (const scale in defaultTheme) {
    for (const scaleKey in defaultTheme[scale]) {
      // For every value in this theme, create a fallback if no JS is enabled.
      const cssVarName = `--${scale}-${scaleKey}`
      const cssVarValue = defaultTheme[scale]![scaleKey]

      styleString += `${cssVarName}:${cssVarValue};`
    }
  }
  styleString += '}'

  return styleString
}
