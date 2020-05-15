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
type Props<T extends InjectableThemes> = {
  themes: DeepPartial<T>
  defaultThemeName: keyof T
  localStorageKey: string
}

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
 * @private
 *
 * @param props
 *
 * @returns The stringified IIFE.
 */
const createInjectableCssVarFn = <T extends InjectableThemes>({
  themes,
  defaultThemeName,
  localStorageKey,
}: Props<T>) => {
  const functionString = String(createCssVarThemes)
    .replace('__THEMES__', JSON.stringify(themes))
    .replace('__DEFAULT_THEME__', defaultThemeName as string)
    .replace('__LOCAL_STORAGE_KEY__', localStorageKey)

  return `(${functionString})()`
}

/**
 * Creates the fallback CSS variable declaration style string that
 * can be injected into a `<style>` tag. Allows for colors and styles for
 * non-JS users and SSR.
 * @private
 *
 * @param props
 *
 * @returns A valid CSS rule string initializing the CSS variables.
 */
const createFallbackStyleString = <T extends InjectableThemes>({
  themes,
  defaultThemeName,
}: Omit<Props<T>, 'localStorageKey'>) => {
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

/**
 * Injects the CSS variable <script> tag at runtime.
 * @private
 */
const injectCssVarScriptTag = <T extends InjectableThemes>(props: Props<T>) => {
  const scriptTag = document.createElement('script')
  scriptTag.id = '__cssVarsInjector'
  scriptTag.innerHTML = createInjectableCssVarFn(props)
  document.head.appendChild(scriptTag)
}

/**
 * Injects the CSS variable fallback <style> tag at runtime.
 * @private
 */
const injectCssVarFallbackStyleTag = <T extends InjectableThemes>(
  props: Omit<Props<T>, 'localStorageKey'>
) => {
  const fallbackStyleRule = createFallbackStyleString(props)
  const styleTag = document.createElement('style')
  styleTag.id = '__cssVarsFallback'
  document.head.appendChild(styleTag)

  styleTag.sheet!.insertRule(fallbackStyleRule)
}

export type AdditionalTheme<T> = DeepPartial<T>

type CreateChangeThemeFunctionArgs<T extends Record<string, any>> = {
  themes: T
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
export const createChangeThemeFn = <T extends Record<string, any>>({
  themes,
  localStorageKey,
}: CreateChangeThemeFunctionArgs<T>) => {
  return (newThemeName: keyof T) => {
    const root = document.documentElement

    // Remove all theme classNames except for the defaultTheme
    for (const themeName in themes) {
      root.classList.remove(themeName)
    }
    root.classList.add(newThemeName as string)

    // persist this change into localStorage
    localStorage.setItem(localStorageKey, newThemeName as string)
  }
}

/**
 * Retrieves the current theme name.
 *
 * @param defaultThemeName - The default theme name to fallback to if in SSR.
 *
 * @returns A string containing the active theme name.
 */
export const getCurrentThemeName = (defaultThemeName?: string) => {
  if (typeof window === 'undefined') return defaultThemeName

  return document.documentElement.className
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

/**
 * A function that will inject the necessary HTML elements that will be placed into
 * `<head>`. The injected `<script>` will inject our theme design tokens as
 * CSS variables, and the injected `<style>` will contain our defaultTheme tokens.
 *
 * @remarks
 * This is the primary way CSR'd apps can integrate `colorway`.
 *
 * @param props
 */
export const injectCssVars = <T extends InjectableThemes>(props: Props<T>) => {
  injectCssVarFallbackStyleTag(props)
  injectCssVarScriptTag(props)
}

/**
 * A React component for injecting our theme as CSS variables. This
 * component should only be rendered in the `<head>` element through a manager such
 * as `react-helmet-async`, NextJS's `<Head />` component, or Gatsby's
 * `setPreBodyComponents()` hook.
 *
 * @remarks
 * This is the primary way SSR'd apps can integrate `colorway`.
 *
 * @param props
 */
export const CssVars = <T extends InjectableThemes>(props: Props<T>) => {
  return (
    <>
      <style id="__cssVarsFallback">{createFallbackStyleString(props)}</style>
      <script
        id="__cssVarsInjector"
        dangerouslySetInnerHTML={{ __html: createInjectableCssVarFn(props) }}
      />
    </>
  )
}
