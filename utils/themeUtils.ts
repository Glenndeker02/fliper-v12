import { Theme } from '@/contexts/ThemeContext';

// Utility function to get theme-aware colors
export const getThemeColors = (theme: Theme) => {
  return theme.colors;
};

// Utility function to create theme-aware styles
export const createThemedStyles = (theme: Theme, styles: any) => {
  // This is a simple implementation - in a real app, you might want to
  // recursively process nested style objects and replace color tokens
  return styles;
};

// Utility function to switch between light and dark themes
export const toggleThemeMode = (currentMode: 'light' | 'dark'): 'light' | 'dark' => {
  return currentMode === 'light' ? 'dark' : 'light';
};

// Helper function to determine if dark mode is active
export const isDarkMode = (theme: Theme): boolean => {
  return theme.mode === 'dark';
};

// Function to get appropriate text color based on background
export const getTextColorForBackground = (theme: Theme, backgroundColor: string): string => {
  // Simple implementation - in a real app, you might analyze the background color
  // and choose text color based on contrast ratios
  return isDarkMode(theme) ? theme.colors.text.primary : theme.colors.text.primary;
};

export default {
  getThemeColors,
  createThemedStyles,
  toggleThemeMode,
  isDarkMode,
  getTextColorForBackground
};