import React, { useContext } from 'react';

export const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);
