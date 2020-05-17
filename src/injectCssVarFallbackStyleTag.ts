import { ColorwayArgs, InjectableThemes } from './types'
import { createFallbackStyleString } from './createFallbackStyleString'

/**
 * Injects the CSS variable fallback <style> tag at runtime.
 */
export const injectCssVarFallbackStyleTag = <T extends InjectableThemes>(
  props: Omit<ColorwayArgs<T>, 'localStorageKey'>
): void => {
  const styleTag = document.createElement('style')
  styleTag.id = '__cssVarsFallback'

  document.head.appendChild(styleTag)

  styleTag.sheet!.insertRule(createFallbackStyleString(props))
}
