import { InjectableThemes, ColorwayArgs } from './types'
import { injectCssVarFallbackStyleTag } from './injectCssVarFallbackStyleTag'
import { injectCssVarScriptTag } from './injectCssVarScriptTag'

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
export const injectCssVars = <T extends InjectableThemes>(
  props: ColorwayArgs<T>
): void => {
  injectCssVarFallbackStyleTag(props)
  injectCssVarScriptTag(props)
}
