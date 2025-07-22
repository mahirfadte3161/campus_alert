import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../ThemeContext';

const StatusBarComponent = () => {
  const { theme } = useTheme();
  
  return (
    <StatusBar 
      style={theme === 'dark' ? 'light' : 'dark'}
      backgroundColor={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
    />
  );
};

export default StatusBarComponent;
