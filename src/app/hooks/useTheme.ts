import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onDarkFontWeight, onLightFontWeight } from '../../config.css';
import { plauderDarkTheme, plauderLightTheme } from '../../plauderTheme.css';
import { settingsAtom } from '../state/settings';
import { useSetting } from '../state/hooks/settings';

export enum ThemeKind {
  Light = 'light',
  Dark = 'dark',
}

export type Theme = {
  id: string;
  kind: ThemeKind;
  classNames: string[];
};

/** Plauder light — replaces upstream Light as the default light theme. */
export const LightTheme: Theme = {
  id: 'plauder-light',
  kind: ThemeKind.Light,
  classNames: ['plauder-light', plauderLightTheme, onLightFontWeight, 'prism-light'],
};

/** Plauder dark — replaces upstream Dark as the default dark theme. */
export const DarkTheme: Theme = {
  id: 'plauder-dark',
  kind: ThemeKind.Dark,
  classNames: ['plauder-dark', plauderDarkTheme, onDarkFontWeight, 'prism-dark'],
};

export const useThemes = (): Theme[] => useMemo(() => [LightTheme, DarkTheme], []);

export const useThemeNames = (): Record<string, string> =>
  useMemo(
    () => ({
      [LightTheme.id]: 'Light',
      [DarkTheme.id]: 'Dark',
    }),
    []
  );

export const useSystemThemeKind = (): ThemeKind => {
  const darkModeQueryList = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)'), []);
  const [themeKind, setThemeKind] = useState<ThemeKind>(
    darkModeQueryList.matches ? ThemeKind.Dark : ThemeKind.Light
  );

  useEffect(() => {
    const handleMediaQueryChange = () => {
      setThemeKind(darkModeQueryList.matches ? ThemeKind.Dark : ThemeKind.Light);
    };

    darkModeQueryList.addEventListener('change', handleMediaQueryChange);
    return () => {
      darkModeQueryList.removeEventListener('change', handleMediaQueryChange);
    };
  }, [darkModeQueryList, setThemeKind]);

  return themeKind;
};

export const useActiveTheme = (): Theme => {
  const systemThemeKind = useSystemThemeKind();
  const themes = useThemes();
  const [systemTheme] = useSetting(settingsAtom, 'useSystemTheme');
  const [themeId] = useSetting(settingsAtom, 'themeId');
  const [lightThemeId] = useSetting(settingsAtom, 'lightThemeId');
  const [darkThemeId] = useSetting(settingsAtom, 'darkThemeId');

  if (!systemTheme) {
    return themes.find((theme) => theme.id === themeId) ?? LightTheme;
  }

  return systemThemeKind === ThemeKind.Dark
    ? themes.find((theme) => theme.id === darkThemeId) ?? DarkTheme
    : themes.find((theme) => theme.id === lightThemeId) ?? LightTheme;
};

const ThemeContext = createContext<Theme | null>(null);
export const ThemeContextProvider = ThemeContext.Provider;

export const useTheme = (): Theme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('No theme provided!');
  }

  return theme;
};
