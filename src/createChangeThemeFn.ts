interface CreateChangeThemeFunctionArgs<T extends Record<string, any>> {
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
}: CreateChangeThemeFunctionArgs<T>): ((newThemeName: keyof T) => void) => {
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
