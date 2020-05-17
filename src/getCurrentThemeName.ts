/**
 * Retrieves the current theme name.
 *
 * @param defaultThemeName - The default theme name to fallback to if in SSR.
 * @returns A string containing the active theme name.
 */
export const getCurrentThemeName = (
  defaultThemeName?: string
): string | undefined => {
  if (typeof window === 'undefined') return defaultThemeName

  return document.documentElement.className
}
