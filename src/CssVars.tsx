import React from 'react'

import { InjectableThemes, ColorwayArgs } from './types'
import { createFallbackStyleString } from './createFallbackStyleString'
import { createInjectableCssVarFn } from './createInjectableCssVarFn'

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
export const CssVars = <T extends InjectableThemes>(props: ColorwayArgs<T>) => {
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
