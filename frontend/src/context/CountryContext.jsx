import React, { createContext, useContext, useState, useEffect } from 'react';

const CountryContext = createContext();

// African countries configuration with comprehensive theming
export const COUNTRIES = {
  NG: {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    currencySymbol: '₦',
    language: 'en',
    flagImage: '/assets/flags/nigeria.svg',
    theme: {
      // Primary brand colors from flag (Green)
      primary: {
        50: '#e6f4ed',
        100: '#c0e4d3',
        200: '#96d3b6',
        300: '#6cc199',
        400: '#4db483',
        500: '#2ea76d',
        600: '#299f65',
        700: '#23965a',
        800: '#1d8c50',
        900: '#127a3e',
      },
      // Secondary colors (Light Green)
      secondary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      // Tertiary colors (Dark Green)
      tertiary: {
        50: '#e8f5e9',
        100: '#c8e6c9',
        200: '#a5d6a7',
        300: '#81c784',
        400: '#66bb6a',
        500: '#4caf50',
        600: '#43a047',
        700: '#388e3c',
        800: '#2e7d32',
        900: '#1b5e20',
      },
      // Accent colors (Gold/Yellow)
      accent: {
        50: '#fff9e6',
        100: '#fff0c0',
        200: '#ffe696',
        300: '#ffdc6c',
        400: '#ffd54d',
        500: '#ffcd2e',
        600: '#ffc829',
        700: '#ffc123',
        800: '#ffba1d',
        900: '#ffad12',
      },
      // Semantic colors
      success: '#2ea76d',
      warning: '#ffcd2e',
      error: '#dc2626',
      info: '#3b82f6',
      // UI colors
      background: '#ffffff',
      surface: '#f9fafb',
      border: '#e5e7eb',
      text: {
        primary: '#111827',
        secondary: '#6b7280',
        tertiary: '#9ca3af',
      },
    },
  },
  GH: {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    currencySymbol: '₵',
    language: 'en',
    flagImage: '/assets/flags/ghana.svg',
    theme: {
      // Primary colors (Red)
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      // Secondary colors (Gold/Yellow)
      secondary: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      // Tertiary colors (Green)
      tertiary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      // Accent colors (Gold)
      accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      success: '#16a34a',
      warning: '#fbbf24',
      error: '#dc2626',
      info: '#3b82f6',
      background: '#ffffff',
      surface: '#fefcf9',
      border: '#e7e5e4',
      text: {
        primary: '#1c1917',
        secondary: '#78716c',
        tertiary: '#a8a29e',
      },
    },
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    currencySymbol: 'KSh',
    language: 'en',
    flagImage: '/assets/flags/kenya.svg',
    theme: {
      // Primary colors (Red)
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      // Secondary colors (Black)
      secondary: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
      },
      // Tertiary colors (Green)
      tertiary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      // Accent colors (Green)
      accent: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      success: '#16a34a',
      warning: '#f59e0b',
      error: '#dc2626',
      info: '#3b82f6',
      background: '#ffffff',
      surface: '#fafafa',
      border: '#e5e5e5',
      text: {
        primary: '#171717',
        secondary: '#737373',
        tertiary: '#a3a3a3',
      },
    },
  },
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    currencySymbol: 'R',
    language: 'en',
    flagImage: '/assets/flags/south-africa.svg',
    theme: {
      // Primary colors (Green)
      primary: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
      },
      // Secondary colors (Gold)
      secondary: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      // Tertiary colors (Red)
      tertiary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      // Accent colors (Gold)
      accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      success: '#059669',
      warning: '#f59e0b',
      error: '#dc2626',
      info: '#0ea5e9',
      background: '#ffffff',
      surface: '#f8fafc',
      border: '#e2e8f0',
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
        tertiary: '#94a3b8',
      },
    },
  },
  EG: {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    currency: 'EGP',
    currencySymbol: 'E£',
    language: 'ar',
    flagImage: '/assets/flags/egypt.svg',
    theme: {
      // Primary colors (Red)
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
      },
      // Secondary colors (White/Cream)
      secondary: {
        50: '#ffffff',
        100: '#fffef7',
        200: '#fefce8',
        300: '#fef9c3',
        400: '#fef08a',
        500: '#fde047',
        600: '#facc15',
        700: '#eab308',
        800: '#ca8a04',
        900: '#a16207',
      },
      // Tertiary colors (Black)
      tertiary: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
      },
      // Accent colors (Gold)
      accent: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
      },
      success: '#16a34a',
      warning: '#facc15',
      error: '#dc2626',
      info: '#3b82f6',
      background: '#ffffff',
      surface: '#fffef7',
      border: '#fef3c7',
      text: {
        primary: '#18181b',
        secondary: '#71717a',
        tertiary: '#a1a1aa',
      },
    },
  },
  RW: {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: 'RWF',
    currencySymbol: 'FRw',
    language: 'en',
    flagImage: '/assets/flags/rwanda.svg',
    theme: {
      // Primary colors (Blue)
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      // Secondary colors (Yellow)
      secondary: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
      },
      // Tertiary colors (Green)
      tertiary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
      // Accent colors (Yellow)
      accent: {
        50: '#fefce8',
        100: '#fef9c3',
        200: '#fef08a',
        300: '#fde047',
        400: '#facc15',
        500: '#eab308',
        600: '#ca8a04',
        700: '#a16207',
        800: '#854d0e',
        900: '#713f12',
      },
      success: '#16a34a',
      warning: '#facc15',
      error: '#dc2626',
      info: '#0ea5e9',
      background: '#ffffff',
      surface: '#f8fafc',
      border: '#e0f2fe',
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
      },
    },
  },
};

export const CountryProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState(() => {
    // Load from localStorage or default to Nigeria
    const saved = localStorage.getItem('selectedCountry');
    return saved || 'NG';
  });

  const country = COUNTRIES[selectedCountry];

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('selectedCountry', selectedCountry);
    
    // Apply theme to CSS variables
    applyTheme(country.theme);
  }, [selectedCountry, country]);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // Apply primary color scale
    Object.entries(theme.primary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color);
    });
    
    // Apply secondary color scale
    Object.entries(theme.secondary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color);
    });
    
    // Apply tertiary color scale
    Object.entries(theme.tertiary).forEach(([shade, color]) => {
      root.style.setProperty(`--color-tertiary-${shade}`, color);
    });
    
    // Apply accent color scale
    Object.entries(theme.accent).forEach(([shade, color]) => {
      root.style.setProperty(`--color-accent-${shade}`, color);
    });
    
    // Apply semantic colors
    root.style.setProperty('--color-success', theme.success);
    root.style.setProperty('--color-warning', theme.warning);
    root.style.setProperty('--color-error', theme.error);
    root.style.setProperty('--color-info', theme.info);
    
    // Apply UI colors
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-border', theme.border);
    
    // Apply text colors
    root.style.setProperty('--color-text-primary', theme.text.primary);
    root.style.setProperty('--color-text-secondary', theme.text.secondary);
    root.style.setProperty('--color-text-tertiary', theme.text.tertiary);
    
    // Shorthand for most common uses
    root.style.setProperty('--color-primary', theme.primary[600]);
    root.style.setProperty('--color-primary-hover', theme.primary[700]);
    root.style.setProperty('--color-primary-light', theme.primary[50]);
    root.style.setProperty('--color-secondary', theme.secondary[600]);
    root.style.setProperty('--color-tertiary', theme.tertiary[600]);
    root.style.setProperty('--color-accent', theme.accent[400]);
  };

  const changeCountry = (countryCode) => {
    if (COUNTRIES[countryCode]) {
      setSelectedCountry(countryCode);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <CountryContext.Provider
      value={{
        selectedCountry,
        country,
        countries: COUNTRIES,
        changeCountry,
        formatCurrency,
        theme: country.theme,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};
