import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: {
    gradient1: string;
    gradient2: string;
    blue: string;
    lightBlue: string;
  };
  text: {
    primary: string;
    secondary: string;
    light: string;
    white: string;
  };
  background: {
    white: string;
    light: string;
    card: string;
  };
  accent: {
    black: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  ui: {
    border: string;
    shadow: string;
    overlay: string;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

// Define themes
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: {
      gradient1: '#A8E6F0',
      gradient2: '#D0F0F8',
      blue: '#6DD5ED',
      lightBlue: '#B8E8F5',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
      light: '#9B9B9B',
      white: '#FFFFFF',
    },
    background: {
      white: '#FFFFFF',
      light: '#F8F9FA',
      card: '#FFFFFF',
    },
    accent: {
      black: '#000000',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },
    ui: {
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: {
      gradient1: '#0A2A35',
      gradient2: '#1A3A45',
      blue: '#6DD5ED',
      lightBlue: '#2A4A55',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      light: '#AAAAAA',
      white: '#FFFFFF',
    },
    background: {
      white: '#121212',
      light: '#1E1E1E',
      card: '#1E1E1E',
    },
    accent: {
      black: '#FFFFFF',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },
    ui: {
      border: '#333333',
      shadow: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.8)',
    },
  },
};

// Create context
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);

  // Load theme preference from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode === 'dark') {
          setTheme(darkTheme);
        } else {
          setTheme(lightTheme);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setTheme(lightTheme);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference to storage
  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme.mode === 'light' ? darkTheme : lightTheme;
    setTheme(newTheme);
    saveThemeMode(newTheme.mode);
  };

  const setThemeMode = (mode: ThemeMode) => {
    const newTheme = mode === 'dark' ? darkTheme : lightTheme;
    setTheme(newTheme);
    saveThemeMode(newTheme.mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;