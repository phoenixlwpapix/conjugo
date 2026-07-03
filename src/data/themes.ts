export const themeOptions = [
  {
    id: 'light',
    label: 'Light',
    swatches: ['#fffdf7', '#174f43', '#f2b13d'],
  },
  {
    id: 'dark',
    label: 'Dark',
    swatches: ['#131814', '#7cc7a6', '#d8a94b'],
  },
] as const;

export type ThemeId = (typeof themeOptions)[number]['id'];

export const themeStorageKey = 'conjugo-theme';

export const isThemeId = (value: string | null): value is ThemeId =>
  themeOptions.some((theme) => theme.id === value);
