import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { themeObj } from '../themes';

export const useThemedStyles = (createStyles) => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    const themeColors = themeObj[theme];
    return StyleSheet.create(createStyles(themeColors));
  }, [theme, createStyles]);
};
