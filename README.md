# Colorway <!-- omit in toc -->

Colorway is a tiny library for utilizing [CSS variables][css vars] as your
primary theming mechanism in your app or website. `colorway` is framework
agnostic and can be integrated with any styling solution of your choice.

- [Quick Features](#quick-features)
- [Examples](#examples)
- [Usage](#usage)
- [API](#api)
  - [`<CssVars />`](#cssvars)
    - [Example](#example)
    - [Props](#props)
  - [`injectCssVars`](#injectcssvars)
    - [Example](#example-1)
    - [Args](#args)
  - [`convertThemeToCssVars`](#convertthemetocssvars)
    - [Example](#example-2)
  - [`createChangeThemeFn`](#createchangethemefn)
    - [Example](#example-3)
    - [Args](#args-1)
  - [`getCurrentThemeName`](#getcurrentthemename)
    - [Example](#example-4)
    - [Args](#args-2)

## Quick Features

- 💪 Framework/library agnostic. Use any solution that can generate a `class` or
  `className`
- ♻ First class React support
- 🦺 Fully type-safe
- 💻 SSR support
- 📲 `localStorage` theme persistence
- 🚫 Default theme fallback if JS is disabled

## Examples

- Demo Website - Coming Soon
- TypeScript React - [Source](/examples/typescript-react)
- TypeScript NextJS - Coming Soon
- TypeScript Gatsby - Coming Soon
- Vanilla JavaScript - Coming Soon

## Usage

First, install the library.

```bash
yarn add colorway
```

Then, define your themes.

```tsx
// src/theme.ts
import {
  createChangeThemeFn,
  AdditionalTheme,
  convertThemeToCssVars,
} from 'colorway'

// First, let's define a default theme. This theme will act as the
// basis for any additional themes.
const lightTheme = {
  colors: {
    text: 'black',
    bg: 'white',
  },
}
type Theme = typeof lightTheme

// Typing as `AdditionalTheme` provides autocomplete from our default theme.
const darkTheme: AdditionalTheme<Theme> = {
  colors: {
    text: 'white',
    bg: 'black',
  },
}

// We can support as many themes as we like in an objet like this:
export const themes = {
  lightTheme,
  darkTheme,
}

// We'll be using these values in other places, so let's make them constants.
export const DEFAULT_THEME_NAME: keyof typeof themes = 'lightTheme'
export const LOCAL_STORAGE_KEY = 'myThemeKey'

// `changeTheme` is a type-safe function for changing between themes.
export const changeTheme = createChangeThemeFn({
  themes,
  localStorageKey: LOCAL_STORAGE_KEY,
})

// `theme` is the object we'll actually use to style our app or site.
export const theme = convertThemeToCssVars(lightTheme)
```

Next, let's setup our `<head>` components to inject our CSS variables into our
app. This step may vary based on your current framework, bundler, and if you
need SSR. See [examples](#examples) for some ways to integrate `colorway`.

```tsx
// src/pages/_document.tsx
// Contrived example
import React from 'react'
import { CssVars } from 'colorway'
import { themes, DEFAULT_THEME_NAME, LOCAL_STORAGE_KEY } from '../themes'

const App: React.FC = ({ children }) => {
  return (
    <>
      <Helmet>
        <CssVars
          themes={themes}
          defaultThemeName={DEFAULT_THEME_NAME}
          localStorageKey={LOCAL_STORAGE_KEY}
        />
      </Helmet>
      <body>{children}</body>
    </>
  )
}
```

With our CSS variables now available, we can style our components! `colorway` is
agnostic of your preferred styling method!

```tsx
// src/components/Button.tsx
import React from 'react'
import { css, styled } from 'your-library-of-choice'
import { theme, changeTheme } from '../theme'

// Use it with any `styled` function. Works with runtime libs
// like `@emotion` and statically extracted libs like `linaria`.
export conost StyledButton = styled.button`
  color: ${theme.colors.text};
  background: ${theme.colors.bg};
`

// Or use it with anything that generates a `className`!
// The `css` prop is supported too.
export const ButtonCss = () => {
  return (
    <button
      // `changeTheme` is type-safe too!
      onClick={() => changeTheme('darkTheme')}
      className={css`
        color: ${theme.colors.text};
        background: ${theme.colors.bg};
      `}
    >
      Swap to dark theme!
    </button>
  )
}
```

## API

### `<CssVars />`

A React component for injecting our theme design tokens as CSS variables. This
component should only be rendered in the `<head>` element through a manager such
as `react-helmet-async`, NextJS's `<Head />` component, or Gatsby's
`setPreBodyComponents()` hook.

This is the primary way SSR'd apps can integrate `colorway`.

> ⚠ If this component is not rendered in `<head>`, you will have style
> flickering when your app rehydrates!

#### Example

```tsx
import React from 'react'
import { CssVars } from 'colorway'
import { themes, DEFAULT_THEME_NAME, LOCAL_STORAGE_KEY } from '../themes'

const App: React.FC = ({ children }) => {
  return (
    <>
      <Helmet>
        <CssVars
          themes={themes}
          defaultThemeName={DEFAULT_THEME_NAME}
          localStorageKey={LOCAL_STORAGE_KEY}
        />
      </Helmet>
      <body>{children}</body>
    </>
  )
}
```

#### Props

| Prop             | Type   | Description                                                                |
| ---------------- | ------ | -------------------------------------------------------------------------- |
| themes           | object | An object containing the theme objects to switch between.                  |
| defaultThemeName | string | A valid key of `themes` to be the defaultTheme.                            |
| localStorageKey  | string | A string to use as the your key in `localStorage` to persist theme choice. |

### `injectCssVars`

A function that will create a `<script>` element that will be injected into the
`<head>` element. The injected `<script>` will inject our theme design tokens as
CSS variables.

This is the primary way that a client-side rendered application can integrate
`colorway`.

#### Example

```tsx
import React from 'react'
import ReactDOM from 'react-dom'
import { injectCssVars } from 'colorway'

import { App } from './components/App'
import { themes, DEFAULT_THEME_NAME, LOCAL_STORAGE_KEY } from './theme'

// Inject the <script> before your app is rendered to avoid style flickering.
injectCssVars({
  themes,
  defaultTheme: DEFAULT_THEME_NAME,
  localStorageKey: LOCAL_STORAGE_KEY,
})

ReactDOM.render(<App />, document.getElementById('root'))
```

#### Args

| Arg             | Type   | Description                                                                |
| --------------- | ------ | -------------------------------------------------------------------------- |
| themes          | object | An object containing the theme objects to switch between.                  |
| defaultTheme    | string | A valid key of `themes` to be the defaultTheme.                            |
| localStorageKey | string | A string to use as the your key in `localStorage` to persist theme choice. |

### `convertThemeToCssVars`

A function that will convert an existing `theme` object to properly access CSS
`var()` values. This function will not alter the existing theme object that is
provided.

#### Example

```tsx
const theme = {
  colors: {
    primary: 'red',
  },
}

const cssVarTheme = convertThemeToCssVars(theme)
cssVarTheme.colors.primary === 'var(--colors-primary-red)' // => true
```

### `createChangeThemeFn`

A higher-order function for creating a type-safe function to change between your
themes.

#### Example

```tsx
const themes = {
  lightTheme,
  darkTheme,
}
const LOCAL_STORAGE_KEY = 'myThemeKey'

const changeTheme = createChangeThemeFn({
  themes,
  localStorageKey: LOCAL_STORAGE_KEY,
})

// src/components/ChangeThemeButton.tsx
const ChangeThemeButton = () => {
  return (
    <button onClick={() => changeTheme('darkTheme')}>
      Change to dark theme!
    </button>
  )
}
```

#### Args

| Arg             | Type   | Description                                                                |
| --------------- | ------ | -------------------------------------------------------------------------- |
| themes          | object | An object containing the theme objects to switch between.                  |
| localStorageKey | string | A string to use as the your key in `localStorage` to persist theme choice. |

### `getCurrentThemeName`

A naive function that retrieves the current theme name. This function does this
by reading the entire active `class` on the `<html>` element of the page. If
your `<html>` element has other classes on it, this function will return an
incorrect result.

#### Example

```tsx
import { DEFAULT_THEME_NAME } from '../theme'

const currentThemeName = getCurrentThemeName()
// or provide a fallback for SSR.
const currentThemeNameWithFallback = getCurrentThemeName(DEFAULT_THEME_NAME)
```

#### Args

| Arg              | Type    | Description                                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------------------ |
| defaultThemeName | string? | An optional fallback themeName for use during SSR. This is not needed in most cases. |

[css vars]: https://developer.mozilla.org/en-US/docs/Web/CSS/--*
