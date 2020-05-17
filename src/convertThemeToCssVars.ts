import { InjectableTheme } from './types'
import { cloneObj } from './cloneObj'

/**
 * Converts a `theme` object to properly access CSS var values instead of raw values.
 *
 * @param theme - The `theme` to convert.
 *
 * @returns A new object whose values are replaced with the appropriate CSS var accessors.
 */
export const convertThemeToCssVars = <T extends InjectableTheme>(
  theme: T
): T => {
  let cssVarTheme = cloneObj(theme) as any

  for (const key in cssVarTheme) {
    for (const scaleKey in cssVarTheme[key]) {
      cssVarTheme[key][scaleKey] = `var(--${key}-${scaleKey})`
    }
  }

  return cssVarTheme
}
