import React from 'react'
import { DeepPartial } from 'ts-essentials'

type InjectableTheme = {
  [key: string]: {
    [key: string]: string | number
  }
}
type InjectableThemes = {
  [key: string]: InjectableTheme
}
export type AdditionalTheme<T> = DeepPartial<T>

/**
 * Declares CSS variables and classes from a list of `themes`. This function should
 * only be executed in the <head> as a blocking script. Do not call this directly!
 * @private
 */
const createCssVarThemes = () => {
  // These values are replaced with their real values at run-time by a pretty
  // hacky `.replace()`.
  const themes = JSON.parse('__THEMES__') as InjectableThemes
  const defaultThemeName = '__DEFAULT_THEME__'
  const localStorageKey = '__LOCAL_STORAGE_KEY__'

  // Initialize a CSS class name with our default theme values and add it to
  // the root element. This allows us to selectively override variables
  // in additional theme classes instead of needing to redefine every value.
  const root = document.documentElement
  root.classList.add(defaultThemeName)

  const defaultTheme = themes[defaultThemeName]
  const defaultThemeStyleTag = document.createElement('style')
  defaultThemeStyleTag.id = '__cssVarDefaultTheme'
  document.head.appendChild(defaultThemeStyleTag)

  let defaultThemeCssRule = `.${defaultThemeName}{`
  for (const key in defaultTheme) {
    for (const scaleKey in defaultTheme[key]) {
      const cssVarName = `--${key}-${scaleKey}`
      const cssVarValue = defaultTheme[key][scaleKey] as string

      defaultThemeCssRule += `${cssVarName}:${cssVarValue};`
    }
  }
  defaultThemeCssRule += '}'
  defaultThemeStyleTag.sheet!.insertRule(defaultThemeCssRule)

  // Create a style tag to accumulate each of our theme
  // class names.
  const themesStyleTag = document.createElement('style')
  themesStyleTag.id = '__cssVarThemes'
  document.head.appendChild(themesStyleTag)

  // Generate class names for each of our additional themes.
  for (const themeName in themes) {
    // We've already added the default theme styles to the root element,
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
 * Converts a `theme` object to properly access CSS var values instead of raw values.
 *
 * @param theme - The `theme` to convert.
 *
 * @returns A new object whose values are replaced with the appropriate CSS var accessors.
 */
export const convertThemeToCssVars = <T extends InjectableTheme>(
  theme: T
): T => {
  // Deeply clone our theme object.
  let cssVarTheme = JSON.parse(JSON.stringify(theme))

  for (const key in cssVarTheme) {
    for (const scaleKey in cssVarTheme[key]) {
      cssVarTheme[key][scaleKey] = `var(--${key}-${scaleKey})`
    }
  }

  return cssVarTheme
}

type CreateChangeThemeFunctionArgs<T extends Record<string, any>> = {
  themes: T
  defaultThemeName: keyof T
  localStorageKey: string
}
/**
 * Higher order function for creating a function to toggle between themes.
 *
 * @param args - Configuration options for the change theme function.
 *
 * @returns A strongly-typed function to change between themes and persist the
 * theme preference to localStorage.
 */
export const createChangeThemeFunction = <T extends Record<string, any>>({
  themes,
  defaultThemeName,
  localStorageKey,
}: CreateChangeThemeFunctionArgs<T>) => {
  return (newThemeName: keyof T) => {
    const root = document.documentElement

    // Remove all theme classNames except for the defaultTheme
    for (const themeName in themes) {
      if (themeName === defaultThemeName) continue
      root.classList.remove(themeName)
    }

    // If we're changing to a non-default-theme, add the appropriate
    // class
    if (newThemeName !== defaultThemeName)
      root.classList.add(newThemeName as string)

    // persist this change into localStorage
    localStorage.setItem(localStorageKey, newThemeName as string)
  }
}

type Props = {
  themes: DeepPartial<InjectableThemes>
  defaultTheme: string
  localStorageKey: string
}

export const createInjectableScript = ({
  themes,
  defaultTheme,
  localStorageKey,
}: Props) => {
  // TODO: Consolidate to single object?
  const functionString = String(createCssVarThemes)
    .replace('__THEMES__', JSON.stringify(themes))
    .replace('__DEFAULT_THEME__', defaultTheme)
    .replace('__LOCAL_STORAGE_KEY__', localStorageKey)

  return `(${functionString})()`
}

export const InjectableScriptTag = (props: Props) => {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: createInjectableScript(props) }}
    />
  )
}
