// DOM-facing theme helpers used by provider and tests

const STORAGE_KEY = 'app:theme';

type AttrMode = 'class' | 'data-theme';
type SetOpts = { attribute?: AttrMode; root?: Document | HTMLElement };

export function setThemeOnDocument(
  themeName: string,
  opts: SetOpts = {}
): void {
  if (!themeName) return;
  const attribute: AttrMode = opts.attribute ?? 'data-theme';
  const rootEl =
    (opts.root as any)?.documentElement
      ? (opts.root as Document).documentElement
      : (opts.root as HTMLElement) ?? document.documentElement;

  if (!rootEl) return;

  if (attribute === 'data-theme') {
    (rootEl as HTMLElement).dataset.theme = themeName;
  } else {
    // strip previous theme-* classes
    rootEl.classList.forEach((c) => {
      if (c.startsWith('theme-')) rootEl.classList.remove(c);
    });
    rootEl.classList.add(`theme-${themeName}`);
  }
}

export function persistTheme(themeName: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, themeName);
  } catch {}
}

export function readPersistedTheme(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Resolution order:
 * 1) DOM attribute/class on <html>
 * 2) localStorage
 * 3) system preference ('dark'|'light')
 */
export function getResolvedTheme(): string {
  const html = typeof document !== 'undefined' ? document.documentElement : null;
  if (html) {
    const fromData = (html as HTMLElement).dataset?.theme;
    if (fromData) return fromData;
    const classTheme = Array.from(html.classList).find((c) => c.startsWith('theme-'));
    if (classTheme) return classTheme.replace(/^theme-/, '');
  }
  const stored = readPersistedTheme();
  if (stored) return stored;
  return systemPrefersDark() ? 'dark' : 'light';
}

export const storageKey = STORAGE_KEY;
