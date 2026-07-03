export const themeOptions = [
  {
    id: 'light',
    label: 'Light',
    swatches: ['#fffdf7', '#174f43', '#f2b13d'],
  },
  {
    id: 'dark',
    label: 'Dark',
    swatches: ['#0f121a', '#6d9ff5', '#e4b650'],
  },
] as const;

export type ThemeId = (typeof themeOptions)[number]['id'];

export const themeStorageKey = 'conjugo-theme';

export const isThemeId = (value: string | null): value is ThemeId =>
  themeOptions.some((theme) => theme.id === value);
