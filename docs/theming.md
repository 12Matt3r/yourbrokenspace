# Theming Engine

This document outlines the architecture and usage of the application's design token and theming system.

## 1. Design Tokens

The foundation of the system is a set of design tokens defined as CSS variables in `styles/tokens.css`. These tokens control all core visual properties like colors, fonts, radii, and shadows.

- **`--color-bg`**: Main background color.
- **`--color-fg`**: Main foreground (text) color.
- **`--color-primary`**: Primary accent color for buttons and links.
- **`--color-muted`**: A subtle color for secondary text or borders.
- **`--radius-md`**: The default border radius for most elements.
- **`--shadow-2`**: The default elevation shadow for interactive elements.

These tokens are mapped to Tailwind CSS utilities in `tailwind.config.js`, allowing you to use classes like `bg-primary` or `rounded-md` which automatically respect the current theme.

## 2. ThemeProvider and useTheme

The system is managed by the `ThemeProvider` component, which should wrap the entire application. It is located in `components/theme/ThemeProvider.tsx`.

### `useTheme()` Hook

To interact with the current theme, use the `useTheme` hook:

```tsx
import { useTheme } from '@/components/theme/ThemeProvider';

function MyComponent() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // 'theme' can be 'light', 'dark', or 'system'
  // 'resolvedTheme' is always 'light' or 'dark'

  return (
    <button onClick={() => setTheme('dark')}>
      Set Dark Mode
    </button>
  );
}
```

### `ThemeScript`

To prevent a "flash of unthemed content" (FOUC) on the initial page load, the `<ThemeScript />` component must be placed in the `<head>` of your `app/layout.tsx`. It runs before any React code and sets the theme based on the user's `localStorage` preference.

## 3. Adding a New Token

1.  **Add the token** to the `:root` selector in `styles/tokens.css`.
2.  **Add a corresponding dark mode value** in the `:root[data-theme="dark"]` selector.
3.  **(Optional)** Map the new token to a Tailwind utility in `tailwind.config.js`.
