import { InjectableThemes, ColorwayArgs } from './types'

/**
 * Injects the CSS variable <script> tag at runtime.
 * @private
 */
export const injectCssVarScriptTag = <T extends InjectableThemes>(
  props: ColorwayArgs<T>
) => {
  const scriptTag = document.createElement('script')

  scriptTag.id = '__cssVarsInjector'
  scriptTag.innerHTML = createInjectableCssVarFn(props)

  document.head.appendChild(scriptTag)
}
