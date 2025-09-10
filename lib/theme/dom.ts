import type { ThemeId, ThemeSpec, ThemeTokens } from "./types";

const STYLE_ID_PREFIX = "app-theme-style-";

function ensureStyleForTheme(theme: ThemeSpec) {
  const id = STYLE_ID_PREFIX + theme.id;
  if (document.getElementById(id)) return;
  const cssVars = tokensToCss(theme.tokens);
  const css = `[data-theme="${theme.id}"]{${cssVars}}`;
  const el = document.createElement("style");
  el.id = id; el.textContent = css;
  document.head.appendChild(el);
}

function tokensToCss(t: ThemeTokens): string {
  const kv: Record<string, string> = {
    "--background": t.colors.bg,
    "--foreground": t.colors.fg,
    "--card": t.colors.surface,
    "--card-foreground": t.colors.fg,
    "--popover": t.colors.surface,
    "--popover-foreground": t.colors.fg,
    "--primary": t.colors.primary,
    "--primary-foreground": t.colors.primaryFg,
    "--secondary": t.colors.muted,
    "--secondary-foreground": t.colors.mutedFg,
    "--muted": t.colors.muted,
    "--muted-foreground": t.colors.mutedFg,
    "--accent": t.colors.primary,
    "--accent-foreground": t.colors.primaryFg,
    "--destructive": "oklch(62.75% 0.226 16.58)", // A reasonable default red
    "--destructive-foreground": "oklch(98.01% 0.021 16.58)",
    "--border": t.colors.surface,
    "--input": t.colors.surface,
    "--ring": t.colors.primary,
    "--radius": t.radii.md,
    // Note: The user's spec included spacing and shadow tokens, which are not currently
    // mapped to CSS variables here. This can be extended later.
    // ...(t.font?.body ? {"--font-body": t.font.body} : {}),
    // ...(t.font?.mono ? {"--font-mono": t.font.mono} : {})
  };
  return Object.entries(kv).map(([k, v]) => `${k}:${v};`).join("");
}

export function applyThemeToDOM(theme: ThemeSpec | ThemeId, registry?: Record<ThemeId, ThemeSpec>) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  const spec: ThemeSpec =
    typeof theme === "string"
      ? (registry?.[theme as ThemeId] ?? { id: theme, name: theme, tokens: defaultTokensFor(theme as ThemeId) })
      : theme;

  // Install stylesheet for custom themes once
  if (spec.id.startsWith("custom:")) ensureStyleForTheme(spec);

  // Idempotent switch
  if (root.dataset.theme !== spec.id) {
    root.dataset.theme = spec.id;
    root.classList.toggle("dark", spec.tokens.mode === "dark");
    window.dispatchEvent(new CustomEvent("app:themechange", { detail: { id: spec.id }}));
  }
}

// Fallback tokens for built-ins (kept tiny here)
function defaultTokensFor(id: ThemeId): ThemeTokens {
  const dark = id === "dark";
  return {
    mode: dark ? "dark" : "light",
    colors: {
      bg: dark ? "#0b0b0c" : "#ffffff",
      fg: dark ? "#eceef1" : "#111114",
      surface: dark ? "#151518" : "#f5f7fa",
      primary: "#5b8cff", primaryFg: "#ffffff",
      muted: dark ? "#222429" : "#e9ecf2",
      mutedFg: dark ? "#b9bfca" : "#394150"
    },
    radii: { sm: "4px", md: "8px", lg: "12px" },
    spacing: { sm: "4px", md: "8px", lg: "16px" },
    shadow: { sm: "0 1px 2px rgb(0 0 0 / .08)", md: "0 4px 10px rgb(0 0 0 / .12)", lg: "0 10px 20px rgb(0 0 0 / .16)" }
  };
}
