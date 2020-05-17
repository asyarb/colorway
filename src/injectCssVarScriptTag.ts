import { InjectableThemes, ColorwayArgs } from './types'
import { createInjectableCssVarFn } from './createInjectableCssVarFn'

/**
 * Injects the CSS variable <script> tag at runtime.
 * @private
 */
export const injectCssVarScriptTag = <T extends InjectableThemes>(
  props: ColorwayArgs<T>
): void => {
  const scriptTag = document.createElement('script')

  scriptTag.id = '__cssVarsInjector'
  scriptTag.innerHTML = createInjectableCssVarFn(props)

  document.head.appendChild(scriptTag)
}
