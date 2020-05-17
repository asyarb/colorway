import { InjectableThemes, ColorwayArgs } from './types'

/**
 * Declares CSS variables and classes from a list of `themes`. This function should
 * only be executed in the <head> as a blocking script. Do not call this directly!
 * @private
 */
const createCssVarThemes = (): void => {
  // These values are replaced with their real values at run-time by a pretty
  // hacky `.replace()`.
  const themes = JSON.parse('__THEMES__') as InjectableThemes
  const defaultThemeName = '__DEFAULT_THEME__'
  const localStorageKey = '__LOCAL_STORAGE_KEY__'
  const root = document.documentElement

  // Create a style tag to accumulate each of our theme
  // class names.
  const themesStyleTag = document.createElement('style')
  themesStyleTag.id = '__cssVarThemes'
  document.head.appendChild(themesStyleTag)

  // Generate class names for each of our additional themes.
  for (const themeName in themes) {
    // We've already added the default theme styles via our <style> fallback,
    // so let's skip it.
    if (themeName === defaultThemeName) continue

    // Accumulate a class CSS rule.
    let themeCssRule = `.${themeName}{`
    const theme = themes[themeName]

    for (const scale in theme) {
      for (const scaleKey in theme[scale]) {
        // For every value in this theme, create a CSS
        // var override and add it to our CSS class definition.
        const cssVarName = `--${scale}-${scaleKey}`
        const cssVarValue = theme[scale][scaleKey] as string

        themeCssRule += `${cssVarName}:${cssVarValue};`
      }
    }
    themeCssRule += '}'
    themesStyleTag.sheet!.insertRule(themeCssRule)
  }

  const persistedThemeName = localStorage.getItem(localStorageKey)
  if (persistedThemeName) root.classList.add(persistedThemeName)
}

/**
 * Creates the stringified IIFE that can be injected into a <script>
 * tag to inject CSS vars before HTML is loaded.
 *
 * @param props
 * @returns The stringified IIFE.
 */
export const createInjectableCssVarFn = <T extends InjectableThemes>({
  themes,
  defaultThemeName,
  localStorageKey,
}: ColorwayArgs<T>): string => {
  const functionString = String(createCssVarThemes)
    .replace('__THEMES__', JSON.stringify(themes))
    .replace('__DEFAULT_THEME__', defaultThemeName as string)
    .replace('__LOCAL_STORAGE_KEY__', localStorageKey)

  return `(${functionString})()`
}
