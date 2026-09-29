/**
 * ChatGPT-style Theme Manager: System, Dark, and Light mode support
 */

export type ThemePreference = 'system' | 'dark' | 'light';

export const THEME_STORAGE_KEY = 'chatbai_theme_preference';

export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  // Migrate old 'chatbai_theme' if exists
  const oldTheme = window.localStorage.getItem('chatbai_theme');
  if (oldTheme === 'light' || oldTheme === 'dark') {
    return oldTheme;
  }
  return 'system';
}

export function applyTheme(pref: ThemePreference): 'dark' | 'light' {
  const resolved = pref === 'system' ? getSystemTheme() : pref;

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', resolved);
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
    // Sync old key for backwards-compatibility
    window.localStorage.setItem('chatbai_theme', resolved);
  }

  return resolved;
}

export function initTheme(): ThemePreference {
  const pref = getStoredThemePreference();
  applyTheme(pref);

  // Listen to OS theme changes if user selected 'system'
  if (typeof window !== 'undefined' && window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      const currentPref = getStoredThemePreference();
      if (currentPref === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener('change', listener);
  }

  return pref;
}
