import { z } from "zod";

export type ThemeId = "light" | "dark" | `custom:${string}`;

export type ThemeTokens = {
  mode: "light" | "dark";
  colors: {
    bg: string; // e.g., "#0b0b0c" or "oklch(15% 0.02 260)"
    fg: string;
    surface: string;
    primary: string;
    primaryFg: string;
    muted: string;
    mutedFg: string;
  };
  radii: { sm: string; md: string; lg: string };
  spacing: { sm: string; md: string; lg: string };
  shadow: { sm: string; md: string; lg: string };
  font?: { body?: string; mono?: string };
};
export type ThemeSpec = { id: ThemeId; name: string; tokens: ThemeTokens };

export const ThemeSchema = z.object({
  id: z.string().regex(/^light$|^dark$|^custom:[a-z0-9\-]{1,64}$/),
  name: z.string().min(1).max(64),
  tokens: z.object({
    mode: z.enum(["light","dark"]),
    colors: z.object({
      bg: z.string(), fg: z.string(), surface: z.string(),
      primary: z.string(), primaryFg: z.string(),
      muted: z.string(), mutedFg: z.string()
    }),
    radii: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
    spacing: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
    shadow: z.object({ sm: z.string(), md: z.string(), lg: z.string() }),
    font: z.object({ body: z.string().optional(), mono: z.string().optional() }).optional()
  })
});
