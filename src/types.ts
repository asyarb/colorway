import { DeepPartial } from 'ts-essentials'

export type InjectableTheme = {
  [key: string]: {
    [key: string]: string | number
  }
}
export type InjectableThemes = {
  [key: string]: InjectableTheme
}
export type ColorwayArgs<T extends InjectableThemes> = {
  themes: DeepPartial<T>
  defaultThemeName: keyof T
  localStorageKey: string
}

export type AdditionalTheme<T> = DeepPartial<T>
