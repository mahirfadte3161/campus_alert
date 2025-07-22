import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, ActivityIndicator, View } from 'react-native';
import { ThemeContext } from './ThemeContext';

const THEME_STORAGE_KEY = '@user:themePreference';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Default to system theme or 'light' if system theme is not available
        const systemTheme = Appearance.getColorScheme();
        const defaultTheme = systemTheme || 'light';
        setTheme(defaultTheme);
        await AsyncStorage.setItem(THEME_STORAGE_KEY, defaultTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to light theme if there's an error
      setTheme('light');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
  };

  // Show loading splash while theme preference is being loaded
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
